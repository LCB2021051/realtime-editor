import React, { useEffect, useState, useRef } from 'react';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../Socket';
import ACTIONS from '../Actions';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const EditorPage = () => {
  const socketRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();

  const [clients, setClients] = useState([]);
  const [isSocketInitialized, setIsSocketInitialized] = useState(false);

  const reactNavigator = useNavigate();

  function handleErrors(e) {
    console.log('socket error', e);
    toast.error('Socket connection failed, try again later.');
    reactNavigator('/');
  }

  useEffect(() => {
    if (socketRef.current) return;

    const init = async () => {
      try {
        socketRef.current = await initSocket();

        socketRef.current.on('connect_error', handleErrors);
        socketRef.current.on('connect_failed', handleErrors);

        socketRef.current.on(ACTIONS.ERROR, ({ message }) => {
          toast.error(message);
          reactNavigator('/'); // Redirect or prompt user for a new name
        });

        socketRef.current.emit(ACTIONS.JOIN, {
          roomId,
          userName: location.state?.userName,
        });

        socketRef.current.on(ACTIONS.JOINED, ({ clients: newClients, userName, socketId }) => {
          if (userName !== location.state?.userName) {
            toast.success(`${userName} joined the room.`);
          }
          setClients((prevClients) => {
            const updatedClients = [...prevClients];
            newClients.forEach((newClient) => {
              const exists = updatedClients.some(client => client.socketId === newClient.socketId);
              if (!exists) {
                updatedClients.push(newClient);
              }
            });
            return updatedClients;
          });
        });

        socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, userName }) => {
          toast.success(`${userName} left the room.`);
          setClients((prev) => prev.filter((client) => client.socketId !== socketId));
        });

        setIsSocketInitialized(true);
      } catch (err) {
        console.error('Socket initialization failed:', err);
      }
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
      }
    };
  }, [roomId, location]);

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img className="logoImage" src="/IIITL.png" alt="logo" />
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} userName={client.userName} />
            ))}
          </div>
        </div>
        <button className="btn copyBtn">Copy ROOM ID</button>
        <button className="btn leaveBtn">Leave</button>
      </div>
      <div className="editorWrap">
        {isSocketInitialized && (
          <Editor socketRef={socketRef} roomId={roomId} />
        )}
      </div>
    </div>
  );
};

export default EditorPage;
