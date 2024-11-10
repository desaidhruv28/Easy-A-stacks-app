import { useState, useEffect } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Typography,
	Box,
	CircularProgress,
	Alert,
} from "@mui/material";
import AnimatedFire from "./AnimatedFire";

export default function LeaderBoard() {
	const [leaderboardData, setLeaderboardData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const videoId = "673046a47a6c49c6e7211dbe";

	useEffect(() => {
		const fetchLeaderboard = async () => {
			try {
				setLoading(true);
				setError(null);

				const response = await fetch(
					`http://localhost:5001/api/leaderboard/video/${videoId}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
					}
				);

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const data = await response.json();
				if (data.success) {
					setLeaderboardData(data.data.leaderboard);
				} else {
					throw new Error(
						data.error || "Failed to fetch leaderboard data"
					);
				}
			} catch (error) {
				console.error("Error fetching leaderboard:", error);
				setError(error.message);
			} finally {
				setLoading(false);
			}
		};

		fetchLeaderboard();
	}, [videoId]);

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
				<Alert severity="error">
					Error loading leaderboard: {error}
				</Alert>
			</Box>
		);
	}

	if (!leaderboardData.length) {
		return (
			<Box m={3}>
				<Alert severity="info">No leaderboard data available</Alert>
			</Box>
		);
	}

	return (
		<Box sx={{ width: "100%", maxWidth: 800, margin: "0 auto", p: 3 }}>
			<Typography
				variant="h4"
				component="h2"
				gutterBottom
				sx={{ color: "white" }}
			>
				Leaderboard
				<AnimatedFire />
			</Typography>
			<TableContainer component={Paper} elevation={3}>
				<Table sx={{ minWidth: 650 }} aria-label="leaderboard table">
					<TableHead>
						<TableRow sx={{ backgroundColor: "primary.main" }}>
							<TableCell sx={{ color: "white" }}>Rank</TableCell>
							<TableCell sx={{ color: "white" }}>Name</TableCell>
							<TableCell sx={{ color: "white" }}>Score</TableCell>
							<TableCell sx={{ color: "white" }}>Date</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{leaderboardData.map((entry) => (
							<TableRow
								key={entry.userId}
								sx={{
									"&:nth-of-type(odd)": {
										backgroundColor: "action.hover",
									},
								}}
							>
								<TableCell>{entry.rank}</TableCell>
								<TableCell>{entry.name}</TableCell>
								<TableCell>{entry.score}</TableCell>
								<TableCell>
									{new Date(
										entry.quizDate
									).toLocaleDateString()}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
}
