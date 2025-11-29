"use client";

import React, { useState, useRef, useEffect } from "react";
import "./DemoPlayer.css";

interface DemoFile {
    name: string;
    filename: string;
    duration: string;
    size: string;
}

const DemoPlayer: React.FC = () => {
    const [currentTrack, setCurrentTrack] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [sortBy, setSortBy] = useState<"name" | "duration">("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    const audioRef = useRef<HTMLAudioElement>(null);

    const demos: DemoFile[] = [
        {
            name: "You are driving me insane",
            filename: "you-are-driving-me-insane.m4a",
            duration: "3:45",
            size: "1.8MB"
        },
        {
            name: "Girl you lol fine bridge",
            filename: "girl-you-lol-fine-bridge.m4a",
            duration: "1:20",
            size: "459KB"
        },
        {
            name: "Hideaway updated demo",
            filename: "hideaway-updated-demo.m4a",
            duration: "2:45",
            size: "1.0MB"
        },
        {
            name: "Sunburnt shrederino",
            filename: "sunburnt-shrederino.m4a",
            duration: "2:30",
            size: "1.2MB"
        },
        {
            name: "Ya seeeeee (demo)",
            filename: "ya-seeeeee(demo).m4a",
            duration: "2:55",
            size: "1.1MB"
        },
        {
            name: "Hmmm (demo)",
            filename: "hmmm(demo).m4a",
            duration: "1:50",
            size: "636KB"
        },
        {
            name: "Song idea",
            filename: "song-idea.m4a",
            duration: "2:15",
            size: "1.2MB"
        }
    ];

    const sortedDemos = [...demos].sort((a, b) => {
        const aValue = sortBy === "name" ? a.name.toLowerCase() : a.duration;
        const bValue = sortBy === "name" ? b.name.toLowerCase() : b.duration;

        if (sortOrder === "asc") {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
    });

    const handleSort = (column: "name" | "duration") => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("asc");
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
                setDuration(audio.duration);
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleTimeUpdate = () => {
            updateProgress();
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("ended", handleEnded);
            // Pause and clear audio source to free memory
            audio.pause();
            audio.src = "";
            audio.load();
        };
    }, [currentTrack]);

    const handlePlayTrack = async (filename: string) => {
        if (currentTrack === filename && isPlaying) {
            // Pause current track
            audioRef.current?.pause();
            setIsPlaying(false);
        } else {
            // Play new track
            if (audioRef.current) {
                setCurrentTrack(filename);
                audioRef.current.src = `/audio/demos/${filename}`;
                
                try {
                    // Wait for the audio to be ready before playing
                    await audioRef.current.load();
                    await audioRef.current.play();
                    setIsPlaying(true);
                } catch (error) {
                    console.error("Error playing audio:", error);
                    setIsPlaying(false);
                    setCurrentTrack(null);
                }
            }
        }
    };

    return (
        <div className="playerContainer">
            <div className="tableContainer">
                <table className="table">
                    <thead className="tableHeader">
                        <tr className="headerRow">
                            <th
                                className={`headerCell sortable`}
                                onClick={() => handleSort("name")}
                                style={{ maxWidth: "300px" }}
                            >
                                Song Name
                                {sortBy === "name" && (
                                    <span className="sortIcon">
                                        {sortOrder === "asc" ? "▲" : "▼"}
                                    </span>
                                )}
                            </th>
                            <th
                                className={`headerCell sortable`}
                                onClick={() => handleSort("duration")}
                                style={{ width: "15%" }}
                            >
                                Time
                                {sortBy === "duration" && (
                                    <span className="sortIcon">
                                        {sortOrder === "asc" ? "▲" : "▼"}
                                    </span>
                                )}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="tableBody">
                        {sortedDemos.map((demo) => (
                            <tr
                                key={demo.filename}
                                className={`tableRow ${currentTrack === demo.filename ? "playing" : ""}`}
                                onClick={() => handlePlayTrack(demo.filename)}
                            >
                                <td className="tableCell">
                                    <div className="playButtonContainer">
                                        <button
                                            className={`circularPlayer ${currentTrack === demo.filename && isPlaying ? "playing" : ""}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePlayTrack(demo.filename);
                                            }}
                                        >
                                            <svg className="progressRing" viewBox="0 0 36 36">
                                                <circle
                                                    className="progressRingBackground"
                                                    cx="18"
                                                    cy="18"
                                                    r="15.915"
                                                    fill="none"
                                                    stroke="#e0e0e0"
                                                    strokeWidth="3"
                                                />
                                                <circle
                                                    className="progressRingForeground"
                                                    cx="18"
                                                    cy="18"
                                                    r="15.915"
                                                    fill="none"
                                                    stroke={currentTrack === demo.filename ? "#1976d2" : "#e0e0e0"}
                                                    strokeWidth="3"
                                                    strokeDasharray={`${currentTrack === demo.filename ? progress : 0} ${100 - (currentTrack === demo.filename ? progress : 0)}`}
                                                    strokeDashoffset="0"
                                                    transform="rotate(-90 18 18)"
                                                    style={{ transition: "stroke-dasharray 0.1s linear" }}
                                                />
                                            </svg>
                                            <div className="playPauseIcon">
                                                {currentTrack === demo.filename && isPlaying ? (
                                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                                                        <rect x="3" y="2" width="2" height="8" />
                                                        <rect x="7" y="2" width="2" height="8" />
                                                    </svg>
                                                ) : (
                                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                                                        <path d="M3 2 L10 6 L3 10 Z" />
                                                    </svg>
                                                )}
                                            </div>
                                        </button>
                                        <span className="songName">{demo.name}</span>
                                    </div>
                                </td>
                                <td className="tableCell">{demo.duration}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <audio
                ref={audioRef}
                onEnded={() => {
                    setIsPlaying(false);
                    setProgress(0);
                }}
            />
        </div>
    );
};
export default DemoPlayer; // By John Michael
