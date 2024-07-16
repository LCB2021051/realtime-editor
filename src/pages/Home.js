import React, { useState } from "react";
import {v4 as uuidv4} from 'uuid';
import toast from "react-hot-toast";

const Home = () => {
    
    const [roomId, setRoomId] = useState('');
    const [userName, setUserName] = useState('');

    const createNewRoom = (e) => {
        e.preventDefault();
        
        const id = uuidv4();

        setRoomId(id);

        toast.success('Created a new room');
    } 

    return (
        <div className="homePageWrapper">
            <div className="formWrapper">
                <img className="homePageLogo" src="/IIITL.png" alt="collab-editor"/>
                <h4 className="mainLabel">Paste invitation ROOM ID</h4>
                <div className="inputGroup">
                    <input 
                        type="text" 
                        className="inputBox" 
                        placeholder="Room ID"
                        onChange={(e)=>setRoomId(e.target.value)}
                        value={roomId}
                    />
                    <input 
                        type="text" 
                        className="inputBox" 
                        placeholder="User Name"
                        onChange={(e)=>setUserName(e.target.value)}
                        value={userName}
                    />
                    <button className="btn joinBtn">Join</button>
                    <span className="createInfo">
                        if you don't have invite then create &nbsp; 
                        <a onClick={createNewRoom} href="" className="createNewBtn"> 
                            new room 
                        </a>
                    </span>
                </div>
            </div>
            <footer>
                <h4>Build With ❤️ by <a href="https://github.com/LCB2021051">Kor@Ji</a></h4>
            </footer>
        </div>
    )
}

export default Home