'use client';

import { useSession, signOut } from 'next-auth/react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import { useState } from 'react';
import Link from 'next/link';

export default function Navigation() {
  const { data: session, status } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
    handleClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            Book Club Platform
          </Link>
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {status === 'loading' ? (
            <Typography>로딩 중...</Typography>
          ) : session ? (
            <>
              <Link href="/meetings" style={{ textDecoration: 'none' }}>
                <Button color="inherit">모임 목록</Button>
              </Link>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar
                  sx={{ width: 32, height: 32 }}
                  src={session.user?.image || undefined}
                >
                  {session.user?.name?.[0] || 'U'}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem disabled>
                  <Typography variant="body2">
                    {session.user?.name} ({session.user?.email})
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleSignOut}>로그아웃</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Link href="/auth/signin" style={{ textDecoration: 'none' }}>
                <Button color="inherit">로그인</Button>
              </Link>
              <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
                <Button color="inherit" variant="outlined">
                  회원가입
                </Button>
              </Link>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
