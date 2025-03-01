"use client";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import { Send } from "@mui/icons-material";
import { blue, grey } from "@mui/material/colors";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello there, I am Vishal's assistant. How can I help you today?",
    },
  ]);

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);
    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([...messages, { role: "user", content: message }]),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [...otherMessages, { ...lastMessage, content: lastMessage.content + text }];
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((messages) => [
        ...messages,
        { role: "assistant", content: "We're experiencing an issue. Try again shortly." },
      ]);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #ece9e6, #ffffff)",
      }}
    >
      <Stack
        sx={{
          width: isMobile ? "90%" : "450px",
          height: isMobile ? "80%" : "600px",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          p: 3,
          display: "flex",
        }}
      >
        <Divider sx={{ mb: 2 }} />
        <Stack
          sx={{ flexGrow: 1, overflowY: "auto", maxHeight: "100%" }}
          spacing={2}
        >
          {messages.map((msg, index) => (
            <Box key={index} display="flex" justifyContent={msg.role === "assistant" ? "flex-start" : "flex-end"}>
              <Box
                sx={{
                  bgcolor: msg.role === "assistant" ? grey[200] : blue[600],
                  color: msg.role === "assistant" ? "black" : "white",
                  borderRadius: "16px",
                  p: 1.5,
                  maxWidth: "75%",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                }}
              >
                {msg.role === "assistant" ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}
              </Box>
            </Box>
          ))}
          {isLoading && (
            <Box display="flex" justifyContent="flex-start">
              <CircularProgress size={20} />
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <TextField
            variant="outlined"
            fullWidth
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <Button variant="contained" onClick={sendMessage} disabled={isLoading} sx={{ minWidth: "50px" }}>
            <Send />
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
