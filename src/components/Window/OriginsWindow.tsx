import "./OriginsWindow.css";
import React from "react";

interface OriginsWindowProps {
    onClose: () => void;
}

const OriginsWindow: React.FC<OriginsWindowProps> = ({ onClose }) => {
    return (
        <div className="container">
            <div className="content">
                <p>
                    Thank you for stopping by my website - I'm really glad you're here!
                </p>
                <p style={{ marginTop: "20px" }}>
                    I'm Juan. I love writing music, photography, and cutting hair. The purpose of this website is to group all of my creative projects together under one roof.
                </p>
                <p style={{ marginTop: "20px" }}>
                    Here, you can check out what I've created, what I'm currently working on, and even get a first look at future launches.
                </p>
                <p style={{ marginTop: "20px" }}>
                    So go ahead - dive in and explore.
                </p>
                <p style={{ marginTop: "20px" }}>
                    - Juan Zhingre
                </p>
            </div>
        </div>
    );
};
export default OriginsWindow; // By John Michael
