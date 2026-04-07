import React, { useEffect, useRef, useState, KeyboardEvent } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Button,
  Fab,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChatIcon from "@mui/icons-material/Chat";
import { useChat } from "../../hooks/useChat";


const ChatWidget: React.FC = () => {
  const [openChat, setOpenChat] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [input, setInput] = useState("");

  const { messages, sendMessage, loading } = useChat();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // welcome popup
  useEffect(() => {
    const isClosed = localStorage.getItem("hide_welcome");
    if (!isClosed) {
      setTimeout(() => setShowWelcome(true), 1000);
    }
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <>
      {/* FLOAT BUTTON */}
      <Fab
        color="primary"
        onClick={() => setOpenChat(!openChat)}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 9999,
        }}
      >
        <ChatIcon />
      </Fab>

      {/* WELCOME POPUP */}
      {showWelcome && (
        <Paper
          elevation={3}
          sx={{
            position: "fixed",
            bottom: 90,
            right: 90,
            p: 2,
            borderRadius: 3,
            maxWidth: 260,
            zIndex: 9999,
          }}
        >
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2">
              👋 Chào bạn! Mình có thể giúp gì?
            </Typography>

            <IconButton
              size="small"
              onClick={() => {
                setShowWelcome(false);
                localStorage.setItem("hide_welcome", "true");
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      )}

      {/* CHAT BOX */}
      {openChat && (
        <Paper
          elevation={5}
          sx={{
            position: "fixed",
            bottom: 90,
            right: 20,
            width: 360,
            height: 500,
            display: "flex",
            flexDirection: "column",
            borderRadius: 3,
            overflow: "hidden",
            zIndex: 9999,
          }}
        >
          {/* HEADER */}
          <Box
            sx={{
              bgcolor: "primary.main",
              color: "#fff",
              p: 1.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle1">
              🤖 Hỗ trợ khách hàng
            </Typography>

            <IconButton
              size="small"
              onClick={() => setOpenChat(false)}
              sx={{ color: "#fff" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* MESSAGES */}
          <Box
            sx={{
              flex: 1,
              p: 2,
              overflowY: "auto",
              bgcolor: "#f9fafb",
            }}
          >
            {messages.map((m, i) => (
              <Box
                key={i}
                display="flex"
                justifyContent={
                  m.sender === "user" ? "flex-end" : "flex-start"
                }
                mb={1}
              >
                <Box
                  sx={{
                    bgcolor:
                      m.sender === "user"
                        ? "primary.main"
                        : "grey.300",
                    color: m.sender === "user" ? "#fff" : "#000",
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    maxWidth: "75%",
                    whiteSpace: "pre-wrap",
                    fontSize: 14,
                  }}
                >
                  {m.text}
                </Box>
              </Box>
            ))}

            {loading && (
              <Typography variant="body2">🤖 Đang trả lời...</Typography>
            )}

            <div ref={bottomRef} />
          </Box>

          {/* INPUT */}
          <Box
            sx={{
              display: "flex",
              p: 1,
              gap: 1,
              borderTop: "1px solid #eee",
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
            />

            <Button variant="contained" onClick={handleSend}>
              Gửi
            </Button>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default ChatWidget;