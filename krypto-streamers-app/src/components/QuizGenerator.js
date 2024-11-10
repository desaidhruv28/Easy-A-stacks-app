// src/components/QuizGenerator.js
import React, { useState, useEffect } from "react";
import {
	Box,
	Button,
	Typography,
	Radio,
	RadioGroup,
	FormControlLabel,
	FormControl,
	CircularProgress,
	Alert,
	Paper,
} from "@mui/material";

const QuizGenerator = () => {
	const [questions, setQuestions] = useState([]);
	const [score, setScore] = useState(0);
	const [selectedAnswers, setSelectedAnswers] = useState({});
	const [quizSubmitted, setQuizSubmitted] = useState(false);
	const [quizStarted, setQuizStarted] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Static video URL
	const staticVideoUrl = "https://youtu.be/SXqfFTmYmT0"; // Replace with your video URL

	const fetchQuizQuestions = async () => {
		try {
			setLoading(true);
			setError(null);

			console.log("Sending request with URL:", staticVideoUrl);

			const response = await fetch(
				"http://localhost:5001/api/process-youtube",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						youtubeUrl: staticVideoUrl,
					}),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Failed to fetch quiz questions"
				);
			}

			const data = await response.json();

			if (data.questions && Array.isArray(data.questions)) {
				const formattedQuestions = data.questions.map((q, index) => ({
					...q,
					options: q.options.map((opt, idx) => ({
						...opt,
						id: `${index}-${idx}`,
					})),
				}));
				setQuestions(formattedQuestions);
				setQuizStarted(true);
			} else {
				throw new Error("Invalid question format received from server");
			}
		} catch (err) {
			console.error("Quiz generation error:", err);
			setError(err.message || "Failed to generate quiz");
		} finally {
			setLoading(false);
		}
	};

	const handleStartQuiz = () => {
		fetchQuizQuestions();
	};

	const handleOptionSelect = (questionIndex, optionIndex) => {
		if (quizSubmitted) return;
		setSelectedAnswers({
			...selectedAnswers,
			[questionIndex]: optionIndex,
		});
	};

	const handleQuizSubmit = async () => {
		try {
			let newScore = 0;
			questions.forEach((question, index) => {
				if (selectedAnswers[index] !== undefined) {
					const selectedOption =
						question.options[selectedAnswers[index]];
					if (selectedOption && selectedOption.correct) {
						newScore += 1;
					}
				}
			});

			// First update local state
			setScore(newScore);
			setQuizSubmitted(true);

			// Then submit to API
			const response = await fetch(
				"http://localhost:5001/api/submit-quiz-scores",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						userId: "67305102ef3c79e75017f601", // Replace with actual user ID from auth
						videoId: "673046a47a6c49c6e7211dbe", // Replace with actual video ID
						userScore: newScore,
						maxScore: questions.length,
					}),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Failed to submit quiz score"
				);
			}

			const data = await response.json();
			console.log("Quiz score submitted successfully:", data);
		} catch (error) {
			console.error("Error submitting quiz score:", error);
			setError("Failed to submit quiz score. " + error.message);
		}
	};

	const handleRetakeQuiz = () => {
		setScore(0);
		setSelectedAnswers({});
		setQuizSubmitted(false);
		setQuizStarted(false);
	};

	if (loading) {
		return (
			<Box display="flex" justifyContent="center" m={3}>
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Box m={3}>
				<Alert severity="error">{error}</Alert>
			</Box>
		);
	}

	return (
		<Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
			<Typography variant="h4" component="h2" gutterBottom>
				Video Quiz
			</Typography>

			{!quizStarted ? (
				<Button
					variant="contained"
					color="primary"
					fullWidth
					onClick={handleStartQuiz}
					sx={{ my: 2 }}
				>
					Start Quiz
				</Button>
			) : (
				<Box>
					{questions.map((question, questionIndex) => (
						<Paper
							key={questionIndex}
							elevation={3}
							sx={{ mb: 3, p: 3, color: "black" }}
						>
							<Typography variant="h6" gutterBottom>
								Question {questionIndex + 1}:{" "}
								{question.question}
							</Typography>
							<FormControl component="fieldset" fullWidth>
								<RadioGroup>
									{question.options.map(
										(option, optionIndex) => (
											<FormControlLabel
												key={option.id}
												value={optionIndex.toString()}
												control={
													<Radio
														checked={
															selectedAnswers[
																questionIndex
															] === optionIndex
														}
														onChange={() =>
															handleOptionSelect(
																questionIndex,
																optionIndex
															)
														}
														disabled={quizSubmitted}
													/>
												}
												label={
													<Box
														sx={{
															display: "flex",
															alignItems:
																"center",
															color: "black",
														}}
													>
														<Typography
															sx={{
																color: "black",
															}}
														>
															{option.text}
														</Typography>
														{quizSubmitted && (
															<Typography
																component="span"
																sx={{
																	ml: 1,
																	color: option.correct
																		? "success.main"
																		: selectedAnswers[
																				questionIndex
																		  ] ===
																		  optionIndex
																		? "error.main"
																		: "inherit",
																}}
															>
																{option.correct
																	? "✓"
																	: selectedAnswers[
																			questionIndex
																	  ] ===
																	  optionIndex
																	? "✗"
																	: ""}
															</Typography>
														)}
													</Box>
												}
												sx={{
													mb: 1,
													p: 1,
													bgcolor:
														quizSubmitted &&
														option.correct
															? "success.light"
															: quizSubmitted &&
															  selectedAnswers[
																	questionIndex
															  ] ===
																	optionIndex &&
															  !option.correct
															? "error.light"
															: "inherit",
													borderRadius: 1,
												}}
											/>
										)
									)}
								</RadioGroup>
							</FormControl>
						</Paper>
					))}

					{!quizSubmitted ? (
						<Button
							// variant="contained"
							color="#f44336"
							fullWidth
							onClick={handleQuizSubmit}
							// disabled={
							// 	Object.keys(selectedAnswers).length !==
							// 	questions.length
							// }
							sx={{
								mt: 2,
								color: "white",
								backgroundColor: "#f44336",
							}}
						>
							Submit Quiz
						</Button>
					) : (
						<Box sx={{ textAlign: "center", mt: 3 }}>
							<Paper elevation={3} sx={{ p: 3, mb: 2 }}>
								<Typography variant="h5" gutterBottom>
									Your Score: {score} out of{" "}
									{questions.length}
								</Typography>
								<Typography
									variant="body1"
									color="text.secondary"
								>
									{score === questions.length
										? "Perfect score! 🎉"
										: score >= questions.length / 2
										? "Good job! 👍"
										: "Keep practicing! 💪"}
								</Typography>
							</Paper>
							<Button
								variant="outlined"
								color="primary"
								onClick={handleRetakeQuiz}
							>
								Retake Quiz
							</Button>
						</Box>
					)}
				</Box>
			)}
		</Box>
	);
};

export default QuizGenerator;
