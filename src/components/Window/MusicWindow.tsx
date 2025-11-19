import "./MusicWindow.css";
import React from "react";

const MusicWindow: React.FC = () => {
    const musicServices = [
        {
            name: "Spotify Music",
            url: "https://open.spotify.com/artist/4pf6I2Hikzc9N7A36lKlrN?si=uwjBptUyQymSU4VZTz1fFg",
            icon: "/images/icons/spotify.webp"
        },
        {
            name: "Apple Music",
            url: "https://music.apple.com/us/artist/juan-zhingre/1756562979",
            icon: "/images/icons/apple.webp"
        },
        {
            name: "Youtube Music",
            url: "https://music.youtube.com/channel/UCtAbnEnfF5wnlBrmJWWEFRg",
            icon: "/images/icons/youtube.webp"
        },
        {
            name: "Amazon Music",
            url: "https://music.amazon.com/artists/B0D96PWDCL/juan-zhingre?do=play&agent=googleAssistant&ref=dmm_seo_google_gkp_artists",
            icon: "/images/icons/amazon.webp"
        }
    ];

    return (
        <div className="musicContainer">
            <div className="leftSection">
                <div className="profileCircle">
                    <img 
                        src="/images/icons/profile.webp" 
                        alt="Profile"
                        loading="eager"
                        decoding="sync"
                        fetchPriority="high"
                        width={140}
                        height={140}
                        style={{ opacity: 1, display: 'block' }}
                    />
                </div>
                <div className="profileText">
                    hey this is my music
                    <br />
                    hope you enjoy :)
                </div>
            </div>

            <div className="rightSection">
                <div className="serviceList">
                    {musicServices.map((service, index) => (
                        <a
                            key={index}
                            className="serviceItem"
                            href={service.url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img
                                src={service.icon}
                                alt={service.name}
                                className="serviceIcon"
                                loading="eager"
                                decoding="sync"
                                fetchPriority="high"
                                width={28}
                                height={28}
                                style={{ opacity: 1, display: 'block' }}
                            />
                            {service.name}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default MusicWindow; // By John Michael
