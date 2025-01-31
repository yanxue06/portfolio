import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import "../home.css";
import p4 from "../Images/p3.png";

export default function Projects() {
    const Item = styled(Paper)(({ theme }) => ({
        backgroundColor: "#fff",
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: "center",
        color: theme.palette.text.secondary,
    }));
    return (
        <section id="projects" className="p3">
            <div className="projects">
                <div className="projectsCol">
                    <div className="projectsRow">
                        <Card
                            sx={{
                                maxWidth: 500,
                                backgroundColor: "rgb(22, 29, 37, 255)", // Dark background for the card
                                color: "white",
                                boxShadow:
                                    "0 0 8px 8px rgba(235, 235, 235, 0.4)", // Subtle shadow
                                transition:
                                    "transform 0.3s ease, box-shadow 0.3s ease", // Smooth animation
                                ":hover": {
                                    transform: "scale(1.05)", // Slight zoom-in on hover
                                    boxShadow:
                                        "0 0 6px 15px rgba(147, 143, 143, 0.5)", // Enhanced shadow on hover
                                },
                            }}
                        >
                            <CardMedia
                                component="img"
                                alt="green iguana"
                                height="250"
                                image={p4}
                            />
                            <CardContent>
                                <Typography
                                    gutterBottom
                                    variant="h5"
                                    component="div"
                                >
                                    Trackify
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ color: "white" }}
                                >
                                    Custom built expense tracker!
                                </Typography>
                            </CardContent>

                            <CardActions>
                                <Button size="small"> See the Code </Button>
                            </CardActions>
                        </Card>
                        <Card
                            sx={{
                                maxWidth: 500,
                                backgroundColor: "rgb(22, 29, 37, 255)", // Dark background for the card
                                color: "white",
                                boxShadow:
                                    "0 0 8px 8px rgba(235, 235, 235, 0.4)", // Subtle shadow
                                transition:
                                    "transform 0.3s ease, box-shadow 0.3s ease", // Smooth animation
                                ":hover": {
                                    transform: "scale(1.05)", // Slight zoom-in on hover
                                    boxShadow:
                                        "0 0 6px 15px rgba(147, 143, 143, 0.5)", // Enhanced shadow on hover
                                },
                            }}
                        >
                            <CardMedia
                                component="img"
                                alt="green iguana"
                                height="250"
                                image={p4}
                            />
                            <CardContent>
                                <Typography
                                    gutterBottom
                                    variant="h5"
                                    component="div"
                                >
                                    Trackify
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ color: "white" }}
                                >
                                    Custom built expense tracker!
                                </Typography>
                            </CardContent>
                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={{ md: 1 }}
                            >
                                <Item>Python</Item>
                                <Item>Django</Item>
                                <Item>PostgreSQL</Item>
                                <Item>CRUD</Item>
                            </Stack>
                            <CardActions>
                                <Button size="small"> See the Code </Button>
                            </CardActions>
                        </Card>
                    </div>
                    <div className="projectsRow">
                        <Card
                            sx={{
                                maxWidth: 500,
                                backgroundColor: "rgb(22, 29, 37, 255)", // Dark background for the card
                                color: "white",
                                boxShadow:
                                    "0 0 8px 8px rgba(235, 235, 235, 0.4)", // Subtle shadow
                                transition:
                                    "transform 0.3s ease, box-shadow 0.3s ease", // Smooth animation
                                ":hover": {
                                    transform: "scale(1.05)", // Slight zoom-in on hover
                                    boxShadow:
                                        "0 0 6px 15px rgba(147, 143, 143, 0.5)", // Enhanced shadow on hover
                                },
                            }}
                        >
                            <CardMedia
                                component="img"
                                alt="green iguana"
                                height="250"
                                image={p4}
                            />
                            <CardContent>
                                <Typography
                                    gutterBottom
                                    variant="h5"
                                    component="div"
                                >
                                    Trackify
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ color: "white" }}
                                >
                                    Custom built expense tracker!
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button size="small"> See the Code </Button>
                            </CardActions>
                        </Card>
                        <Card
                            sx={{
                                maxWidth: 500,
                                backgroundColor: "rgb(22, 29, 37, 255)", // Dark background for the card
                                color: "white",
                                boxShadow:
                                    "0 0 8px 8px rgba(235, 235, 235, 0.4)", // Subtle shadow
                                transition:
                                    "transform 0.3s ease, box-shadow 0.3s ease", // Smooth animation
                                ":hover": {
                                    transform: "scale(1.05)", // Slight zoom-in on hover
                                    boxShadow:
                                        "0 0 6px 15px rgba(147, 143, 143, 0.5)", // Enhanced shadow on hover
                                },
                            }}
                        >
                            <CardMedia
                                component="img"
                                alt="green iguana"
                                height="250"
                                image={p4}
                            />
                            <CardContent>
                                <Typography
                                    gutterBottom
                                    variant="h5"
                                    component="div"
                                >
                                    Trackify
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ color: "white" }}
                                >
                                    Custom built expense tracker!
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button size="small"> See the Code </Button>
                            </CardActions>
                        </Card>
                    </div>
                    <div className="projectsRow">
                        <Card
                            sx={{
                                maxWidth: 500,
                                backgroundColor: "rgb(22, 29, 37, 255)", // Dark background for the card
                                color: "white",
                                boxShadow:
                                    "0 0 8px 8px rgba(235, 235, 235, 0.4)", // Subtle shadow
                                transition:
                                    "transform 0.3s ease, box-shadow 0.3s ease", // Smooth animation
                                ":hover": {
                                    transform: "scale(1.05)", // Slight zoom-in on hover
                                    boxShadow:
                                        "0 0 6px 15px rgba(147, 143, 143, 0.5)", // Enhanced shadow on hover
                                },
                            }}
                        >
                            <CardMedia
                                component="img"
                                alt="green iguana"
                                height="250"
                                image={p4}
                            />
                            <CardContent>
                                <Typography
                                    gutterBottom
                                    variant="h5"
                                    component="div"
                                >
                                    Trackify
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ color: "white" }}
                                >
                                    Custom built expense tracker!
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button size="small"> See the Code </Button>
                            </CardActions>
                        </Card>
                        <Card
                            sx={{
                                maxWidth: 500,
                                backgroundColor: "rgb(22, 29, 37, 255)", // Dark background for the card
                                color: "white",
                                boxShadow:
                                    "0 0 8px 8px rgba(235, 235, 235, 0.4)", // Subtle shadow
                                transition:
                                    "transform 0.3s ease, box-shadow 0.3s ease", // Smooth animation
                                ":hover": {
                                    transform: "scale(1.05)", // Slight zoom-in on hover
                                    boxShadow:
                                        "0 0 6px 15px rgba(147, 143, 143, 0.5)", // Enhanced shadow on hover
                                },
                            }}
                        >
                            <CardMedia
                                component="img"
                                alt="green iguana"
                                height="250"
                                image={p4}
                            />
                            <CardContent>
                                <Typography
                                    gutterBottom
                                    variant="h5"
                                    component="div"
                                >
                                    Trackify
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ color: "white" }}
                                >
                                    Custom built expense tracker!
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button size="small"> See the Code </Button>
                            </CardActions>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    );
}
