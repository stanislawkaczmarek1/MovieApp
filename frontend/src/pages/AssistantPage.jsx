import { useState, useRef, useEffect } from "react";
import '../css/AssistantPage.css';

function AssistantPage() {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const chatContainerRef = useRef(null);

    const sendMessage = async () => {
        if (!inputMessage.trim()) return;

        setMessages((prevMessages) => [
            ...prevMessages,
            { role: "user", content: inputMessage },
        ]);
        setLoading(true);
        setInputMessage("");

        try {
            const response = await fetch("http://localhost:5000/chat", { 
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: inputMessage, history: messages }),
            });

            const data = await response.json();
            setMessages((prevMessages) => [
                ...prevMessages,
                { role: "assistant", content: data.reply },
            ]);
        } catch (error) {
            console.error("ERROR:", error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        const chatContainer = chatContainerRef.current;
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            sendMessage();
        }
    };

    return (
        <div className="assistant-page">
            <div className="chat-container">
                <h1>Film Assistant</h1>
                <div 
                    ref={chatContainerRef} 
                    className="chat-box"
                >
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.role}`}>
                            <strong>{msg.role === "user" ? "You:" : "GPT:"}</strong>
                            {msg.content.split("\n").map((line, idx) => (
                                <div key={idx}>{line}</div>
                            ))}
                        </div>
                    ))}
                    {loading && (
                        <div className="message assistant">
                            <strong>GPT:</strong> <em>Responding...</em>
                        </div>
                    )}
                </div>
                <div className="input-container">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                        placeholder="Type a message..."
                    />
                    <button onClick={sendMessage} disabled={loading}>
                        {loading ? "Loading..." : "Send"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AssistantPage;
