import axios from "axios";

const API_URL = "http://localhost:5001/api";

const api = axios.create({
	baseURL: API_URL,
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

export const userService = {
	getUsers: async () => {
		try {
			const response = await api.get("/users");
			return response;
		} catch (error) {
			console.error("API Error:", error);
			throw error;
		}
	},
};

export const quizService = {
	generateQuiz: async (youtubeUrl) => {
		try {
			const response = await api.post("/process-youtube", {
				youtubeUrl: youtubeUrl,
			});
			return response;
		} catch (error) {
			console.error("API Error:", error);
			throw error;
		}
	},
};
