import React from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";

const Home = () => {
    return (
        <div className="home-container">
            <div className="page-content">
                <h1 className="home-title">
                    Break Language Barriers in Real-Time 
                </h1>

                <p className="home-description">
                    Our platform enables people speaking <strong>different languages</strong>
                    to communicate effortlessly through <strong>real-time video calls</strong>
                    with instant translation — while also helping users
                    <strong> learn new languages naturally</strong>.
                </p>

                <div className="features-grid">
                    <div className="feature-card">
                        <h3>Language Learning Mode</h3>
                        <p>
                            Choose any language you want to learn.
                            Understand how common words, sentences, and conversations
                            are spoken in your <strong>own language</strong>.
                        </p>
                        <ul>
                            <li>Word-by-word understanding</li>
                            <li>Real conversation examples</li>
                            <li>Learn while communicating</li>
                        </ul>
                        <Link to="/translate" className="feature-btn">
                            Start Learning
                        </Link>
                        
                    </div>

                    <div className="feature-card">
                        <h3> Multilingual Video Call</h3>
                        <p>
                            Join video calls with multiple users — even if everyone
                            speaks a <strong>different language</strong>.
                        </p>
                        <ul>
                            <li>Live speech-to-text translation</li>
                            <li>Each user hears in their own language</li>
                            <li>Perfect for meetings & global teams</li>
                        </ul>
                        <Link to="/video_call" className="feature-btn">
                            Start Video Call
                        </Link>
                    </div>

                    <div className="feature-card">
                        <h3>Real-World Use Cases</h3>
                        <p>
                            Designed for real communication, not just theory.
                        </p>
                        <ul>
                            <li>International meetings</li>
                            <li>Online learning & teaching</li>
                            <li>Global collaboration</li>
                            <li>Language practice with real people</li>
                        </ul>
                    </div>
                </div>

                <p className="cta-text">
                    Learn languages naturally. Communicate without limits.
                    <br />
                    <strong>One platform. Many languages.</strong>
                </p>
            </div>
        </div>
    );
};

export default Home;
