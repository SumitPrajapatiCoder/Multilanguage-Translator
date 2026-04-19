import React from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";

const Home = () => {
    return (
        <div className="home-container">
            <div className="overlay"></div>

            <div className="page-content">
                <h1 className="home-title">
                    Real-Time AI Translation for Conversations & Meetings
                </h1>

                <p className="home-description">
                    Break language barriers instantly with <strong>real-time AI translation</strong>.
                    Speak naturally — your voice is converted into <strong>text, translated, and played in another language</strong> during live meetings.
                    Perfect for global communication, learning, and collaboration.
                </p>

                <div className="cta-buttons">
                    <Link to="/create-meeting" className="primary-btn">
                        Start Meeting
                    </Link>

                    <Link to="/translate" className="secondary-btn">
                        Learn Language
                    </Link>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <h3>AI-Powered Language Learning</h3>
                        <p>Learn languages while you speak and listen.</p>
                        <ul>
                            <li>Live speech → translated text</li>
                            <li>Understand context instantly</li>
                            <li>Practice real conversations</li>
                        </ul>
                    </div>

                    <div className="feature-card">
                        <h3>Real-Time Smart Meetings</h3>
                        <p>Talk with people speaking different languages — instantly.</p>
                        <ul>
                            <li>Speech → Text → Translation → Voice</li>
                            <li>Each user chooses their language</li>
                            <li>Live subtitles + audio output</li>
                        </ul>
                    </div>

                    <div className="feature-card">
                        <h3>Seamless Global Communication</h3>
                        <p>Collaborate without language limits.</p>
                        <ul>
                            <li>Remote teams & global meetings</li>
                            <li>Online classes & discussions</li>
                            <li>Travel & real-world communication</li>
                        </ul>
                    </div>

                    <div className="feature-card">
                        <h3>Audio & File Translation</h3>
                        <p>Upload audio/video and get instant translation.</p>
                        <ul>
                            <li>Supports audio & video files</li>
                            <li>Auto language detection</li>
                            <li>Translated speech output</li>
                        </ul>
                    </div>
                </div>

                <p className="cta-text">
                    Speak your language. Let AI handle the rest.
                </p>
            </div>
        </div>
    );
};

export default Home;