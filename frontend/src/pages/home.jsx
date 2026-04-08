import React from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";

const Home = () => {
    return (
        <div className="home-container">
            <div className="overlay"></div>

            <div className="page-content">
                <h1 className="home-title">
                    Real-Time AI Video Translation 
                </h1>

                <p className="home-description">
                    Talk to anyone, anywhere — in <strong>any language</strong>.
                    Experience seamless <strong>video calls with live translation</strong>
                    and learn languages naturally while communicating.
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
                        <h3>AI Language Learning</h3>
                        <p>Understand conversations in real-time.</p>
                        <ul>
                            <li>Word-by-word meaning</li>
                            <li>Context-based translation</li>
                            <li>Learn while speaking</li>
                        </ul>
                    </div>

                    <div className="feature-card">
                        <h3> Smart Video Calls</h3>
                        <p>Multi-user meetings with live translation.</p>
                        <ul>
                            <li>Speech → Text → Translation</li>
                            <li>Auto subtitles</li>
                            <li>Real-time sync</li>
                        </ul>
                    </div>

                    <div className="feature-card">
                        <h3> Global Communication</h3>
                        <p>Break language barriers completely.</p>
                        <ul>
                            <li>Remote teams</li>
                            <li>Online education</li>
                            <li>Cross-country collaboration</li>
                        </ul>
                    </div>
                </div>

                <p className="cta-text">
                    One platform. Infinite conversations.
                </p>
            </div>
        </div>
    );
};

export default Home;