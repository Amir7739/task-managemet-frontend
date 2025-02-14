import React from 'react';
import { AppBar, Toolbar, Typography, Button, Grid, Card, CardContent, CardMedia, Container, Box } from '@mui/material';
import { styled } from '@mui/system';
import { Link } from 'react-router-dom';  // Import Link from react-router-dom

// Styled components for the homepage
const Root = styled('div')(({ theme }) => ({
  backgroundColor: '#fafafa',
  minHeight: '100vh',
  paddingTop: theme.spacing(8),
}));

const Header = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#6200ea',
  color: 'white',
}));

const MainContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
}));

const CardStyled = styled(Card)(({ theme }) => ({
  borderRadius: '10px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    boxShadow: '0 6px 18px rgba(0, 0, 0, 0.2)',
  },
}));

const CardImage = styled(CardMedia)(({ theme }) => ({
  height: 200,
  objectFit: 'cover',
  borderRadius: '10px 10px 0 0',
}));

const Footer = styled(Box)(({ theme }) => ({
  backgroundColor: '#6200ea',
  color: 'white',
  padding: theme.spacing(3, 0),
  textAlign: 'center',
}));

const HomePage = () => {
  return (
    <Root>
      {/* Header */}
      <Header position="fixed">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Learing Management Website
          </Typography>
          {/* Navigation Buttons */}
          <Button color="inherit" component={Link} to="/login">
            Login
          </Button>
        </Toolbar>
      </Header>

      {/* Main Content */}
      <MainContent>
        <Container maxWidth="lg">
          <Typography variant="h3" gutterBottom>
            Welcome to Our Learning Management Website😍!
          </Typography>
          <Typography variant="h6" paragraph>
            Discover our exciting features and start using our service to boost your productivity.
          </Typography>
          <Button variant="contained" size="large" sx={{ backgroundColor: '#6200ea', color: 'white', '&:hover': { backgroundColor: '#3700b3' } }}>
            Get Started
          </Button>
        </Container>
      </MainContent>

      {/* Feature Cards Section */}
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <CardStyled>
              <CardImage component="img" alt="Feature 1" image="https://www.shutterstock.com/image-vector/business-planning-task-management-concept-260nw-1987578881.jpg" />
              <CardContent>
                <Typography variant="h5">Feature 1</Typography>
                <Typography variant="body2" color="textSecondary">
                  Discover the amazing capabilities of Feature 1. It’s designed to help you achieve more with less.
                </Typography>
                <Button size="small" sx={{ backgroundColor: '#6200ea', color: 'white', '&:hover': { backgroundColor: '#3700b3' } }}>
                  Learn More
                </Button>
              </CardContent>
            </CardStyled>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <CardStyled>
              <CardImage component="img" alt="Feature 2" image="https://st2.depositphotos.com/1532932/11808/v/450/depositphotos_118086462-stock-illustration-agility-is-reached-by-effective.jpg" />
              <CardContent>
                <Typography variant="h5">Feature 2</Typography>
                <Typography variant="body2" color="textSecondary">
                  Explore how Feature 2 can transform your business processes for the better.
                </Typography>
                <Button size="small" sx={{ backgroundColor: '#6200ea', color: 'white', '&:hover': { backgroundColor: '#3700b3' } }}>
                  Learn More
                </Button>
              </CardContent>
            </CardStyled>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <CardStyled>
              <CardImage component="img" alt="Feature 3" image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-79kNrlxjMffzDwIHGTEoCRPk5T56_kSLHQ&s" />
              <CardContent>
                <Typography variant="h5">Feature 3</Typography>
                <Typography variant="body2" color="textSecondary">
                  Feature 3 offers a unique set of tools to enhance your productivity and streamline your workflow.
                </Typography>
                <Button size="small" sx={{ backgroundColor: '#6200ea', color: 'white', '&:hover': { backgroundColor: '#3700b3' } }}>
                  Learn More
                </Button>
              </CardContent>
            </CardStyled>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Footer>
        <Typography variant="body2">© 2025 My Learing Management App. All rights reserved.</Typography>
      </Footer>
    </Root>
  );
};

export default HomePage;
