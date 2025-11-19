import React from "react";
import "./Origins.css";

interface CreditsWindowProps {
    onClose: () => void;
}

const CreditsWindow: React.FC<CreditsWindowProps> = ({ onClose }) => {
    return (
        <div className="container">
            <div className="content">
                <p>
                    Thank you for stopping by my website. I'm glad that you are here! You're probably wondering what is all this or who is the guy behind the curtain-let me introduce myself! I am he John Daniel. I love writing music, photography, and cutting hair! This website is an attempt to organize and display all of my creative projects under one roof with the manifesting hope that they will continue to branch out of this small residence and grow out into their own thing. In the meantime, well myself and my creative director/chief web developer, John Michael, have cooked up this cool lil website for you to explore what projects I'm up to, currently working on, and be the first to hear about future launches. Well, have at it. Go explore!
                </p>
                <p style={{ marginTop: "20px" }}>
                    -With love
                </p>
                <p style={{ marginTop: "10px" }}>
                    Juan Zhingre
                </p>
            </div>
        </div>
    );
};
export default CreditsWindow; // By John Michael
