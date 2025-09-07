import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';

const drawerWidth = 240;

export default function AdminLayout({ title = 'Admin', children }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const items = [
    { label: 'Dashboard', icon: <DashboardIcon />, to: '/admin-dashboard' },
    { label: 'Users', icon: <PeopleIcon />, to: '/admin-dashboard#users' },
    { label: 'Jobs', icon: <WorkIcon />, to: '/admin-dashboard#jobs' },
    { label: 'Applications', icon: <AssignmentIcon />, to: '/admin-dashboard#applications' },
    { label: 'Reports', icon: <AssessmentIcon />, to: '/reports' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setOpen(true)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {title}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button color="inherit" onClick={() => {
            try {
              localStorage.removeItem('token');
              localStorage.removeItem('userRole');
            } catch {}
            navigate('/login');
          }}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Drawer open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: drawerWidth }} role="presentation" onClick={() => setOpen(false)}>
          <Typography variant="h6" sx={{ p: 2 }}>Admin</Typography>
          <Divider />
          <List>
            {items.map((item) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton onClick={() => navigate(item.to)}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Toolbar />
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </Box>
    </Box>
  );
}


