import React, { useState, useEffect } from "react";
import {
	Box,
	Container,
	Typography,
	Grid,
	Card,
	CardContent,
	CardMedia,
	CircularProgress,
	Alert,
	Pagination,
	TextField,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Dialog,
	DialogContent,
	IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";

const VideoComponent = () => {
	const [videos, setVideos] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [sortBy, setSortBy] = useState("video_title");
	const [order, setOrder] = useState("asc");
	const [selectedVideo, setSelectedVideo] = useState(null);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchTerm);
			setPage(1);
		}, 500);

		return () => clearTimeout(timer);
	}, [searchTerm]);

	const fetchVideos = async () => {
		try {
			setLoading(true);
			setError(null);
			const queryParams = new URLSearchParams({
				page: page,
				limit: 6,
				search: debouncedSearch,
				sortBy: sortBy,
				order: order,
			});

			const response = await fetch(
				`http://localhost:5001/api/videos?${queryParams.toString()}`
			);

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			const data = await response.json();

			if (data.success) {
				setVideos(data.data.videos);
				setTotalPages(data.data.pagination.totalPages);
			} else {
				throw new Error(data.error || "Failed to fetch videos");
			}
		} catch (error) {
			setError("Failed to fetch videos. Please try again later.");
			console.error("Error:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchVideos();
	}, [page, debouncedSearch, sortBy, order]);

	const handlePageChange = (event, value) => {
		setPage(value);
	};

	const handleVideoClick = (video) => {
		setSelectedVideo(video);
	};

	const handleCloseDialog = () => {
		setSelectedVideo(null);
	};

	const getVideoIdFromUrl = (url) => {
		const urlParams = new URLSearchParams(new URL(url).search);
		return urlParams.get("v");
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
		<Container maxWidth="lg">
			<Box sx={{ py: 4 }}>
				<Typography
					variant="h4"
					component="h1"
					gutterBottom
					sx={{ color: "white", mb: 10 }}
				>
					Video Library
				</Typography>

				{/* Search and Sort Controls */}
				<Grid
					container
					spacing={2}
					sx={{ backgroundColor: "white", p: 5, mb: 5 }}
				>
					<Grid item xs={12} md={6}>
						<TextField
							fullWidth
							variant="outlined"
							placeholder="Search videos..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon />
									</InputAdornment>
								),
							}}
						/>
					</Grid>
					<Grid item xs={12} md={3}>
						<FormControl fullWidth>
							<InputLabel>Sort By</InputLabel>
							<Select
								value={sortBy}
								label="Sort By"
								onChange={(e) => setSortBy(e.target.value)}
							>
								<MenuItem value="video_title">Title</MenuItem>
								<MenuItem value="video_duration">
									Duration
								</MenuItem>
							</Select>
						</FormControl>
					</Grid>
					<Grid item xs={12} md={3}>
						<FormControl fullWidth>
							<InputLabel>Order</InputLabel>
							<Select
								value={order}
								label="Order"
								onChange={(e) => setOrder(e.target.value)}
							>
								<MenuItem value="asc">Ascending</MenuItem>
								<MenuItem value="desc">Descending</MenuItem>
							</Select>
						</FormControl>
					</Grid>
				</Grid>

				{/* Video Grid */}
				<Grid container spacing={3}>
					{videos.map((video) => (
						<Grid item xs={12} sm={6} md={4} key={video._id}>
							<Card
								sx={{
									height: "100%",
									display: "flex",
									flexDirection: "column",
									cursor: "pointer",
									"&:hover": {
										transform: "scale(1.02)",
										transition:
											"transform 0.2s ease-in-out",
									},
								}}
								onClick={() => handleVideoClick(video)}
							>
								<CardMedia
									component="img"
									height="180"
									image={video.video_thumbnail}
									alt={video.video_title}
								/>
								<CardContent>
									<Typography
										gutterBottom
										variant="h6"
										component="div"
										noWrap
									>
										{video.video_title}
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
									>
										Duration:{" "}
										{Math.floor(video.video_duration / 60)}:
										{(video.video_duration % 60)
											.toString()
											.padStart(2, "0")}
									</Typography>
								</CardContent>
							</Card>
						</Grid>
					))}
				</Grid>

				{/* Pagination */}
				{totalPages > 1 && (
					<Box display="flex" justifyContent="center" mt={4}>
						<Pagination
							count={totalPages}
							page={page}
							onChange={handlePageChange}
							color="primary"
						/>
					</Box>
				)}

				{/* Video Dialog */}
				<Dialog
					fullWidth
					maxWidth="md"
					open={Boolean(selectedVideo)}
					onClose={handleCloseDialog}
				>
					<DialogContent sx={{ p: 0 }}>
						<IconButton
							onClick={handleCloseDialog}
							sx={{
								position: "absolute",
								right: 8,
								top: 8,
								color: "white",
								backgroundColor: "rgba(0, 0, 0, 0.5)",
								"&:hover": {
									backgroundColor: "rgba(0, 0, 0, 0.7)",
								},
							}}
						>
							<CloseIcon />
						</IconButton>
						{selectedVideo && (
							<Box
								sx={{
									position: "relative",
									paddingTop: "56.25%",
								}}
							>
								<iframe
									style={{
										position: "absolute",
										top: 0,
										left: 0,
										width: "100%",
										height: "100%",
										border: 0,
									}}
									src={`https://www.youtube.com/embed/${getVideoIdFromUrl(
										selectedVideo.video_url
									)}`}
									title={selectedVideo.video_title}
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
									allowFullScreen
								/>
							</Box>
						)}
					</DialogContent>
				</Dialog>
			</Box>
		</Container>
	);
};

export default VideoComponent;
