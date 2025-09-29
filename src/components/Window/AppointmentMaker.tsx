import React, { useState } from 'react';
import ConfirmationCode from './ConfirmationCode';
import AddressAutocomplete from '../AddressAutocomplete/AddressAutocomplete';
import DistanceValidator from '../DistanceValidator/DistanceValidator';
import { generateConfirmationCode } from '../../utils/confirmationCode';
import './AppointmentMaker.css';

interface AppointmentMakerProps {
    onClose: () => void;
}

const AppointmentMaker: React.FC<AppointmentMakerProps> = ({ onClose }) => {
    // Business location - get from environment variable or use default
    const BUSINESS_LOCATION = process.env.SERVICE_AREA || "Provo, UT";
    
    // Step management
    const [currentStep, setCurrentStep] = useState<'cut-availability' | 'location-contact'>('cut-availability');
    
    // Cut selection
    const [cutSelected, setCutSelected] = useState(false);
    
    // Availability
    const [selectedDay, setSelectedDay] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    
    // Location
    const [isHouseCall, setIsHouseCall] = useState(false);
    
    // Contact info
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [selectedPlace, setSelectedPlace] = useState<any>(null);
    const [isAddressValid, setIsAddressValid] = useState(true);
    const [isAddressSelected, setIsAddressSelected] = useState(false);
    const [isPhoneValid, setIsPhoneValid] = useState(false);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, 1 = next week, etc.
    const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationData, setConfirmationData] = useState<any>(null);
    const [isPreviousWeekFullyBooked, setIsPreviousWeekFullyBooked] = useState(false);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Get current date and time
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute; // Convert to minutes for easier comparison
    
    // Calculate dates for the current week offset
    const getWeekDates = () => {
        const startOfWeek = new Date(now);
        const dayOfWeek = currentDay === 0 ? 6 : currentDay - 1; // Convert Sunday=0 to Monday=0
        startOfWeek.setDate(now.getDate() - dayOfWeek + (weekOffset * 7));
        
        const weekDates = [];
        for (let i = 0; i < 6; i++) { // Monday to Saturday
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            weekDates.push(date);
        }
        return weekDates;
    };
    
    const weekDates = getWeekDates();
    
    // Format date for display (M/D format)
    const formatDate = (date: Date) => {
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    // Load appointment availability
    const loadAppointmentAvailability = async () => {
        try {
            // Get all appointments from database
            const response = await fetch('/api/database/appointments');
            
            if (!response.ok) {
                console.error('Database API error:', response.status, response.statusText);
                setBookedSlots(new Set<string>());
                return;
            }
            
            const result = await response.json();
            
            if (result.success) {
                // Convert appointments to booked slots format
                const bookedSlotsSet = new Set<string>();
                result.appointments.forEach((appointment: any) => {
                    // Use the stored day and date directly from the database
                    const slotKey = `${appointment.date}-${appointment.time}`;
                    bookedSlotsSet.add(slotKey);
                });
                
                setBookedSlots(bookedSlotsSet);
                
                // Clean up old appointments (older than 7 days)
                try {
                    await fetch('/api/database/appointments', {
                        method: 'DELETE'
                    });
                } catch (cleanupError) {
                    console.warn('Failed to clean up old appointments:', cleanupError);
                }
            } else {
                console.error('Failed to load appointments:', result.error);
                setBookedSlots(new Set<string>());
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
            setBookedSlots(new Set<string>());
        }
    };

    // Load availability when week changes
    React.useEffect(() => {
        loadAppointmentAvailability();
    }, [weekOffset]);

    // Auto-advance to next week if current week is fully booked
    React.useEffect(() => {
        if (isWeekFullyBooked() && weekOffset === 0) {
            setWeekOffset(1);
        }
    }, [bookedSlots, weekOffset]);

    // Check previous week availability whenever bookedSlots or weekOffset changes
    React.useEffect(() => {
        checkPreviousWeekAvailability();
    }, [bookedSlots, weekOffset]);
    
    // Check if a day is in the past
    const isDayInPast = (dayIndex: number) => {
        if (weekOffset > 0) return false; // Future weeks are never in the past
        const dayDate = weekDates[dayIndex];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dayDate < today;
    };
    
    // Check if a time slot is in the past
    const isTimeInPast = (dayIndex: number, time: string) => {
        if (weekOffset > 0) return false; // Future weeks are never in the past
        if (isDayInPast(dayIndex)) return true; // Past days are always in the past
        
        const dayDate = weekDates[dayIndex];
        const isToday = dayDate.toDateString() === now.toDateString();
        if (!isToday) return false;
        
        // Parse time (e.g., "4:00PM" -> 16:00)
        const timeMatch = time.match(/(\d+):(\d+)(AM|PM)/i);
        if (!timeMatch) return false;
        
        let hour = parseInt(timeMatch[1]);
        const minute = parseInt(timeMatch[2]);
        const ampm = timeMatch[3].toUpperCase();
        
        if (ampm === 'PM' && hour !== 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;
        
        const slotTime = hour * 60 + minute;
        return slotTime <= currentTime;
    };

    // Check if a time slot is booked
    const isTimeBooked = (dayIndex: number, time: string) => {
        const dayDate = weekDates[dayIndex];
        const dateString = formatDate(dayDate); // Use the same format as database (M/D)
        const slotKey = `${dateString}-${time}`;
        return bookedSlots.has(slotKey);
    };

    // Check if all times for a day are unavailable
    const isDayFullyBooked = (dayIndex: number) => {
        const day = days[dayIndex];
        const timeSlots = getTimeSlots(day);
        
        return timeSlots.every(time => {
            const isPast = isTimeInPast(dayIndex, time);
            const isBooked = isTimeBooked(dayIndex, time);
            return isPast || isBooked;
        });
    };

    // Check if all days in current week are fully booked
    const isWeekFullyBooked = () => {
        return days.every((_, dayIndex) => isDayFullyBooked(dayIndex));
    };

    // Check if all days in previous week are fully booked
    const checkPreviousWeekAvailability = () => {
        if (weekOffset === 0) {
            setIsPreviousWeekFullyBooked(false);
            return;
        }
        
        // Calculate the previous week dates
        const previousWeekOffset = weekOffset - 1;
        const startOfPreviousWeek = new Date(now);
        const dayOfWeek = currentDay === 0 ? 6 : currentDay - 1;
        startOfPreviousWeek.setDate(now.getDate() - dayOfWeek + (previousWeekOffset * 7));
        
        const previousWeekDates: Date[] = [];
        for (let i = 0; i < 6; i++) {
            const date = new Date(startOfPreviousWeek);
            date.setDate(startOfPreviousWeek.getDate() + i);
            previousWeekDates.push(date);
        }
        
        // Check if all days in previous week would be fully booked
        const isFullyBooked = days.every((day, dayIndex) => {
            const dayDate = previousWeekDates[dayIndex];
            const isPast = dayDate < new Date();
            const timeSlots = getTimeSlots(day);
            
            // If it's in the past, consider it "fully booked"
            if (isPast) return true;
            
            // Check if all time slots are booked
            return timeSlots.every(time => {
                const dateString = formatDate(dayDate); // Use the same format as database (M/D)
                const slotKey = `${dateString}-${time}`;
                return bookedSlots.has(slotKey);
            });
        });
        
        setIsPreviousWeekFullyBooked(isFullyBooked);
    };
    
    const getTimeSlots = (day: string) => {
        if (day === 'Saturday') {
            return ['12:00PM', '2:00PM', '4:00PM', '6:00PM'];
        } else {
            return ['4:00PM', '6:00PM'];
        }
    };

    const validatePhone = (phone: string) => {
        // Remove all non-digit characters except +
        const cleanPhone = phone.replace(/[\s\-().]/g, '');
        
        // Check if it's a valid US phone number (10 digits or 11 digits starting with 1)
        const phoneRegex = /^(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
        const isValid = phoneRegex.test(phone);
        
        // Also check length (10-11 digits after cleaning)
        const digitCount = cleanPhone.replace(/^\+?1/, '').length;
        const hasCorrectLength = digitCount === 10;
        
        return isValid && hasCorrectLength;
    };

    const isFirstStepComplete = () => {
        return cutSelected && selectedDay && selectedTime;
    };

    const isFormComplete = () => {
        const hasCut = cutSelected;
        const hasAvailability = selectedDay && selectedTime;
        const hasLocation = isHouseCall !== null;
        const hasContact = name && phone && validatePhone(phone);
        
        // For house calls, address must be valid AND within service area
        // For "at location", no address validation needed
        const hasAddress = !isHouseCall || (address && isAddressValid);
        
        return hasCut && hasAvailability && hasLocation && hasContact && hasAddress;
    };

    const handleNext = () => {
        if (isFirstStepComplete()) {
            setCurrentStep('location-contact');
        }
    };

    const handleBack = () => {
        setCurrentStep('cut-availability');
    };

    const handleSchedule = async () => {
        if (isFormComplete()) {
            setIsSubmitting(true);
            
            try {
                // Get the actual date for the selected day
                const selectedDayIndex = days.indexOf(selectedDay);
                const selectedDate = weekDates[selectedDayIndex];
                const formattedDate = formatDate(selectedDate);
                
                // Generate confirmation code
                const confirmationCode = generateConfirmationCode();
                
                const appointmentDetails = {
                    name: name,
                    phone: phone,
                    cut: 'Volume 1 Cut',
                    day: selectedDay,
                    date: formattedDate,
                    time: selectedTime,
                    location: isHouseCall ? `House Call (+$5) - ${address}` : 'At Location',
                    address: isHouseCall ? address : undefined,
                    confirmationCode: confirmationCode
                };

                // Send SMS confirmation to customer
                console.log('=== CLIENT: SENDING SMS REQUEST ===');
                console.log('Appointment details being sent:', JSON.stringify(appointmentDetails, null, 2));
                console.log('Request URL:', '/api/sms/send-confirmation');
                console.log('Request method:', 'POST');
                
                const smsResponse = await fetch('/api/sms/send-confirmation', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ appointmentDetails })
                });

                console.log('=== CLIENT: SMS RESPONSE RECEIVED ===');
                console.log('Response status:', smsResponse.status);
                console.log('Response statusText:', smsResponse.statusText);
                console.log('Response ok:', smsResponse.ok);
                console.log('Response headers:', Object.fromEntries(smsResponse.headers.entries()));

                if (!smsResponse.ok) {
                    console.error('SMS API error:', smsResponse.status, smsResponse.statusText);
                    const responseText = await smsResponse.text();
                    console.error('Response body:', responseText);
                    const businessPhone = process.env.BUSINESS_PHONE || 'the barber';
                    alert(`SMS confirmation failed to send. Please contact ${businessPhone} directly to confirm your appointment.`);
                    return;
                }

                const smsResult = await smsResponse.json();

                if (smsResult.success) {
                    // SMS sent successfully, show confirmation window
                    const confirmationData = {
                        confirmationCode: confirmationCode,
                        appointmentDetails: appointmentDetails,
                        status: 'pending' as const,
                        createdAt: new Date().toISOString(),
                        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
                    };

                    setConfirmationData(confirmationData);
                    setShowConfirmation(true);
                } else {
                    // SMS failed, show error and suggest contacting barber
                    const businessPhone = process.env.BUSINESS_PHONE || 'the barber';
                    alert(`SMS confirmation failed to send. Please contact ${businessPhone} directly to confirm your appointment.`);
                    
                    // Send error email to dev
                    try {
                        await fetch('/api/email/send-sms-failure', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ 
                                appointmentDetails, 
                                smsError: smsResult.error 
                            })
                        });
                    } catch (emailError) {
                        console.error('Failed to send error email:', emailError);
                    }
                }
            } catch (error) {
                console.error('Appointment error:', error);
                alert('Appointment failed to schedule!');
            } finally {
                setIsSubmitting(false);
            }
        } else {
            alert('Please fill in all required fields');
        }
    };

    const handleConfirmationSuccess = async (code: string) => {
        setShowConfirmation(false);
        
        try {
            // Store appointment in database
            const appointmentData = {
                ...confirmationData.appointmentDetails,
                confirmationCode: code
            };

            const dbResponse = await fetch('/api/database/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(appointmentData)
            });

            const dbResult = await dbResponse.json();

            if (dbResult.success) {
                
                // Send SMS notification to business
                try {
                    await fetch('/api/sms/send-business-notification', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ appointmentDetails: appointmentData })
                    });
                } catch (smsError) {
                    console.error('Failed to send business SMS:', smsError);
                }

                // Send email notification to business
                try {
                    await fetch('/api/email/send-business-notification', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ appointmentDetails: appointmentData })
                    });
                } catch (emailError) {
                    console.error('Failed to send business email:', emailError);
                }

                alert(`Appointment confirmed!\n\nConfirmation Code: ${code}\n\nCut: Volume 1 Cut ($20)\nDay: ${selectedDay}\nTime: ${selectedTime}\nLocation: ${isHouseCall ? `House Call (+$5) - ${address}` : 'At Location'}`);
            } else {
                console.error('Database error:', dbResult.error);
                alert('Appointment confirmed but there was an error saving to database. Please contact us directly.');
            }
        } catch (error) {
            console.error('Error storing appointment:', error);
            alert('Appointment confirmed but there was an error saving to database. Please contact us directly.');
        }
        
        // Reset form
        setCurrentStep('cut-availability');
        setCutSelected(false);
        setSelectedDay('');
        setSelectedTime('');
        setIsHouseCall(false);
        setName('');
        setPhone('');
        setAddress('');
        setSelectedPlace(null);
        setIsAddressValid(true);
        setIsAddressSelected(false);
        setIsPhoneValid(false);
        setConfirmationData(null);
    };

    const handleConfirmationClose = () => {
        setShowConfirmation(false);
        setConfirmationData(null);
    };

    const handleAddressChange = (newAddress: string) => {
        setAddress(newAddress);
        if (!newAddress) {
            setSelectedPlace(null);
            setIsAddressValid(true);
            setIsAddressSelected(false);
        }
    };

    const handlePlaceSelect = (place: any) => {
        setSelectedPlace(place);
        setIsAddressSelected(true);
        // Address validation will be handled by DistanceValidator
    };

    const handleAddressSelected = (isSelected: boolean) => {
        setIsAddressSelected(isSelected);
    };

    const handleAddressValidation = (isValid: boolean, distance?: number) => {
        setIsAddressValid(isValid);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPhone = e.target.value;
        setPhone(newPhone);
        setIsPhoneValid(validatePhone(newPhone));
    };

    // Show confirmation window if needed
    if (showConfirmation && confirmationData) {
        return (
            <ConfirmationCode
                onClose={handleConfirmationClose}
                onConfirm={handleConfirmationSuccess}
                generatedCode={confirmationData.confirmationCode}
                appointmentDetails={confirmationData.appointmentDetails}
            />
        );
    }

    return (
        <div className="container">
            <h1 className="title">
                Schedule an appointment
            </h1>
            
            <div className="formContainer">
                {currentStep === 'cut-availability' && (
                    <>
                        {/* Cut Selection */}
                        <div className="fieldGroup">
                            <label className="label">cut:</label>
                            <div className="cutContainer">
                                <button
                                    className={`cutButton ${cutSelected ? 'selected' : ''}`}
                                    onClick={() => setCutSelected(!cutSelected)}
                                    disabled={isSubmitting}
                                >
                                    volume 1 cut - $20
                                </button>
                            </div>
                        </div>

                        {/* Availability Section - Only show if cut is selected */}
                        {cutSelected && (
                            <div className="fieldGroup">
                                <label className="label">availability:</label>
                                <div className="availabilityContainer">
                                    <div className="daysColumn">
                                        {days.map((day, index) => {
                                            const isPast = isDayInPast(index);
                                            const isFullyBooked = isDayFullyBooked(index);
                                            const isDisabled = isPast || isFullyBooked;
                                            
                                            return (
                                                <button
                                                    key={day}
                                                    className={`dayButton ${selectedDay === day ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                                                    onClick={() => {
                                                        if (!isDisabled) {
                                                            setSelectedDay(day);
                                                            setSelectedTime(''); // Reset time when day changes
                                                        }
                                                    }}
                                                    disabled={isSubmitting || isDisabled}
                                                    title={isFullyBooked ? 'All time slots are booked for this day' : ''}
                                                >
                                                    {day} {formatDate(weekDates[index])}
                                                </button>
                                            );
                                        })}
                                        
                                        {/* Navigation buttons */}
                                        <div className="weekNavigation">
                                            <button
                                                className={`navButton ${isPreviousWeekFullyBooked ? 'disabled' : ''}`}
                                                onClick={() => {
                                                    setWeekOffset(weekOffset - 1);
                                                    setSelectedDay('');
                                                    setSelectedTime('');
                                                }}
                                                disabled={weekOffset === 0 || isSubmitting || isPreviousWeekFullyBooked}
                                                title={isPreviousWeekFullyBooked ? "Previous week is fully booked" : "Previous Week"}
                                            >
                                                ←
                                            </button>
                                            <button
                                                className="navButton"
                                                onClick={() => {
                                                    setWeekOffset(weekOffset + 1);
                                                    setSelectedDay('');
                                                    setSelectedTime('');
                                                }}
                                                disabled={isSubmitting}
                                                title="Next Week"
                                            >
                                                →
                                            </button>
                                        </div>
                                    </div>
                                    <div className="timesColumn">
                                        {selectedDay && getTimeSlots(selectedDay).map(time => {
                                            const selectedDayIndex = days.indexOf(selectedDay);
                                            const isPast = isTimeInPast(selectedDayIndex, time);
                                            const isBooked = isTimeBooked(selectedDayIndex, time);
                                            const isDisabled = isPast || isBooked;
                                            return (
                                                <button
                                                    key={time}
                                                    className={`timeButton ${selectedTime === time ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                                                    onClick={() => {
                                                        if (!isDisabled) {
                                                            setSelectedTime(time);
                                                        }
                                                    }}
                                                    disabled={isSubmitting || isDisabled}
                                                    title={isBooked ? 'This time slot is already booked' : ''}
                                                >
                                                    {time}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Next Button */}
                        <button
                            onClick={handleNext}
                            disabled={!isFirstStepComplete() || isSubmitting}
                            className={`nextButton ${!isFirstStepComplete() ? 'disabled' : ''}`}
                            title={!isFirstStepComplete() ? 'Please select a cut, day, and time' : ''}
                        >
                            Next
                        </button>
                    </>
                )}

                {currentStep === 'location-contact' && (
                    <>
                        {/* Back Button */}
                        <button
                            onClick={handleBack}
                            disabled={isSubmitting}
                            className="backButton"
                        >
                            ← Back
                        </button>

                        {/* Location Section */}
                        <div className="fieldGroup">
                            <label className="label">location:</label>
                            <div className="locationContainer">
                                <button
                                    className={`locationButton ${isHouseCall ? 'selected' : ''}`}
                                    onClick={() => setIsHouseCall(true)}
                                    disabled={isSubmitting}
                                >
                                    house call (+$5)
                                </button>
                                <button
                                    className={`locationButton ${!isHouseCall ? 'selected' : ''}`}
                                    onClick={() => setIsHouseCall(false)}
                                    disabled={isSubmitting}
                                >
                                    at location
                                </button>
                            </div>
                        </div>

                        {/* Contact Info Section */}
                        <div className="fieldGroup">
                            <div className="contactRow">
                                <div className="contactField">
                                    <label className="label">name:</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={isSubmitting}
                                        className="input"
                                    />
                                </div>
                                <div className="contactField">
                                    <label className="label">phone number:</label>
                                    <div className="phoneInputContainer">
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={handlePhoneChange}
                                            disabled={isSubmitting}
                                            className="input"
                                            placeholder="Enter valid phone number"
                                        />
                                        {isPhoneValid && (
                                            <span className="phoneCheckmark">✓</span>
                                        )}
                                    </div>
                                    {phone && !isPhoneValid && (
                                        <span className="errorText">Please enter a valid phone number</span>
                                    )}
                                </div>
                                {isHouseCall && (
                                    <DistanceValidator
                                        address={address}
                                        businessLocation={BUSINESS_LOCATION}
                                        onValidationResult={handleAddressValidation}
                                        isAddressSelected={isAddressSelected}
                                    />
                                )}
                                {isHouseCall && (
                                    <div className="contactField">
                                        <label className="label">address:</label>
                                        <AddressAutocomplete
                                            value={address}
                                            onChange={handleAddressChange}
                                            onPlaceSelect={handlePlaceSelect}
                                            onAddressSelected={handleAddressSelected}
                                            isValid={isAddressValid && isAddressSelected}
                                            disabled={isSubmitting}
                                            placeholder="Enter your address"
                                            className="input"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Schedule Button */}
                        <button
                            onClick={handleSchedule}
                            disabled={!isFormComplete() || isSubmitting}
                            className={`scheduleButton ${!isFormComplete() ? 'disabled' : ''}`}
                            title={
                                isHouseCall && address && !isAddressValid 
                                    ? 'Address is outside service area - please contact us directly'
                                    : !isFormComplete() 
                                        ? 'Please fill in all required fields'
                                        : ''
                            }
                        >
                            {isSubmitting ? 'Scheduling...' : 'Schedule'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}; export default AppointmentMaker;