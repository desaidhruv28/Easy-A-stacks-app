import React, { useState, useEffect } from "react";
import { userService } from "../services/api";
import {
	Box,
	Typography,
	List,
	ListItem,
	ListItemText,
	Paper,
	CircularProgress,
	Alert,
	Divider,
	Container,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { ListItemIcon } from "@mui/material";

const UserList = () => {
	const [users, setUsers] = useState([]);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	const loadUsers = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await userService.getUsers();
			setUsers(response.data || []);
		} catch (error) {
			const errorMessage =
				error.code === "ECONNREFUSED"
					? "Unable to connect to server. Please check if the server is running."
					: "Error loading users. Please try again later.";
			setError(errorMessage);
			console.error("Error details:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadUsers();
	}, []);

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
		<Container maxWidth="md">
			<Box sx={{ py: 4 }}>
				<Typography
					variant="h4"
					component="h2"
					gutterBottom
					sx={{ color: "white" }}
				>
					Users
				</Typography>
				<Paper elevation={3}>
					{users.length === 0 ? (
						<Box p={3}>
							<Alert severity="info">No users found.</Alert>
						</Box>
					) : (
						<List>
							{users.map((user, index) => (
								<React.Fragment key={user.id}>
									<ListItem>
										<ListItemIcon>
											<PersonIcon color="primary" />
										</ListItemIcon>
										<ListItemText
											primary={user.name}
											sx={{
												"& .MuiListItemText-primary": {
													fontWeight: 500,
												},
											}}
										/>
									</ListItem>
									{index < users.length - 1 && <Divider />}
								</React.Fragment>
							))}
						</List>
					)}
				</Paper>
			</Box>
		</Container>
	);
};

export default UserList;
