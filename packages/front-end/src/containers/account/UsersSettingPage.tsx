import {
  ErrorName,
  SigninLocalResponse,
  UpdateEmailRequest,
  UpdatePasswordRequest,
  UpdateUserNameRequest,
  UserData,
  UserDataResponse,
  validateEmail,
  validatePassword,
  validateUserName,
} from "@lockcept/shared";
import {
  Box,
  Card,
  CardContent,
  Container,
  IconButton,
  makeStyles,
  TextField,
  Toolbar,
  Typography,
} from "@material-ui/core";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useLockceptContext } from "../../contexts";
import { errorLogger } from "../../logger";

const useStyles = makeStyles((theme) => ({
  card: {
    marginTop: theme.spacing(2),
  },
}));

const UserSettingPage = () => {
  const classes = useStyles();
  const {
    instance,
    setAccessToken,
    signedUserData,
    setSnackbar,
  } = useLockceptContext();

  const [userData, setUserData] = useState<Omit<
    UserData,
    "id" | "password"
  > | null>(null);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const userId = useMemo(() => {
    if (!signedUserData) return null;
    return signedUserData?.id;
  }, [signedUserData]);

  useEffect(() => {
    if (!userId) {
      setUserData(null);
      return;
    }
    instance
      .get<UserDataResponse>(`/user/users/${userId}`)
      .then((res) => {
        setUserData(res.data.userData);
      })
      .catch((e) => {
        if (e.response) {
          if (e.response.status === 404) {
            setUserData(null);
          }
        }
      });
  }, [instance, userId]);

  useEffect(() => {
    if (!userData) {
      setEmail("");
      setUserName("");
      return;
    }
    setEmail(userData?.email);
    setUserName(userData?.userName);
  }, [userData]);

  const handleEmailUpdate = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const req: UpdateEmailRequest = {
        email,
      };
      const res = await instance.post<SigninLocalResponse>(
        `/user/users/${userId}/email`,
        req
      );
      const { token } = res.data;
      setAccessToken(token);
      setLoading(false);
      setEmail(email);
      setSnackbar({ severity: "info" }, "Success to Update Email");
    } catch (e) {
      errorLogger(e);
      if (e.response) {
        const errorData = e.response.data;
        const errorName = errorData?.options?.name;
        switch (errorName) {
          case ErrorName.ExistingEmail:
            setSnackbar({ severity: "error" }, "Email Already Exists");
            break;
          case ErrorName.InvalidEmail:
            setSnackbar(
              { severity: "error" },
              "Please enter a valid email address."
            );
            break;
          default:
            setSnackbar(
              { severity: "error" },
              e.response.message ?? "Unknown Error"
            );
        }
      }
      setLoading(false);
    }
  }, [email, instance, loading, setAccessToken, setSnackbar, userId]);

  const handlePasswordUpdate = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const req: UpdatePasswordRequest = {
        password,
      };
      const res = await instance.post<SigninLocalResponse>(
        `/user/users/${userId}/password`,
        req
      );
      const { token } = res.data;
      setAccessToken(token);
      setLoading(false);
      setSnackbar({ severity: "info" }, "Success to Update Password");
    } catch (e) {
      errorLogger(e);
      if (e.response) {
        const errorData = e.response.data;
        const errorName = errorData?.options?.name;
        switch (errorName) {
          case ErrorName.InvalidPassword:
            setSnackbar(
              { severity: "error" },
              "Please enter a valid passworsd."
            );
            break;
          default:
            setSnackbar(
              { severity: "error" },
              e.response.message ?? "Unknown Error"
            );
        }
      }
      setLoading(false);
    }
  }, [instance, loading, password, setAccessToken, setSnackbar, userId]);

  const handleUserNameUpdate = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const req: UpdateUserNameRequest = {
        userName,
      };
      const res = await instance.post<SigninLocalResponse>(
        `/user/users/${userId}/userName`,
        req
      );
      const { token } = res.data;
      setAccessToken(token);
      setLoading(false);
      setUserName(userName);
      setSnackbar({ severity: "info" }, "Success to Update UserName");
    } catch (e) {
      errorLogger(e);
      if (e.response) {
        const errorData = e.response.data;
        const errorName = errorData?.options?.name;
        switch (errorName) {
          case ErrorName.ExistingUserName:
            setSnackbar({ severity: "error" }, "UserName Already Exists");
            break;
          case ErrorName.InvalidUserName:
            setSnackbar(
              { severity: "error" },
              "Please enter a valid user name."
            );
            break;
          default:
            setSnackbar(
              { severity: "error" },
              e.response.message ?? "Unknown Error"
            );
        }
      }
      setLoading(false);
    }
  }, [instance, loading, setAccessToken, setSnackbar, userId, userName]);

  const emailValidation = useMemo(() => {
    if (email === "" || validateEmail(email)) return "";
    return "Please enter a valid email address.";
  }, [email]);
  const passwordValidation = useMemo(() => {
    if (password === "" || validatePassword(password)) return "";
    return "Your password does not meet the password requirements: alphabet, number, 8-16 length";
  }, [password]);
  const confirmPasswordValidation = useMemo(() => {
    if (password === confirmPassword) return "";
    return "Your passwords are not equal";
  }, [password, confirmPassword]);
  const userNameValidation = useMemo(() => {
    if (userName === "" || validateUserName(userName)) return "";
    return "Please enter a valid user name.";
  }, [userName]);

  return (
    <Container maxWidth="lg">
      <Card className={classes.card}>
        <Toolbar>
          <Typography variant="subtitle1" color="textSecondary">
            Update Email
          </Typography>
          <Box flex={1} />
        </Toolbar>
        <CardContent>
          <Box display="flex">
            <Box flexGrow={1}>
              <TextField
                variant="outlined"
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                value={email}
                error={emailValidation.length > 0}
                helperText={emailValidation}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </Box>
            <IconButton
              onClick={handleEmailUpdate}
              disabled={
                emailValidation.length > 0 ||
                !email ||
                email === userData?.email
              }
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
      <Card className={classes.card}>
        <Toolbar>
          <Typography variant="subtitle1" color="textSecondary">
            Update Password
          </Typography>
          <Box flex={1} />
        </Toolbar>
        <CardContent>
          <Box display="flex">
            <Box flex={1} mr={2}>
              <TextField
                variant="outlined"
                fullWidth
                id="password"
                type="password"
                label="Password"
                name="password"
                error={passwordValidation.length > 0}
                helperText={passwordValidation}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
            </Box>
            <Box flex={1}>
              <TextField
                variant="outlined"
                fullWidth
                id="confirm-password"
                type="password"
                label="Confirm Password"
                name="confirm-password"
                error={confirmPasswordValidation.length > 0}
                helperText={confirmPasswordValidation}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                }}
              />
            </Box>
            <IconButton
              onClick={handlePasswordUpdate}
              disabled={
                passwordValidation.length > 0 ||
                confirmPasswordValidation.length > 0 ||
                !password ||
                !confirmPassword ||
                password !== confirmPassword
              }
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
      <Card className={classes.card}>
        <Toolbar>
          <Typography variant="subtitle1" color="textSecondary">
            Update UserName
          </Typography>
          <Box flex={1} />
        </Toolbar>
        <CardContent>
          <Box display="flex">
            <Box flexGrow={1}>
              <TextField
                variant="outlined"
                fullWidth
                id="user-name"
                label="User Name"
                name="user-name"
                value={userName}
                error={userNameValidation.length > 0}
                helperText={userNameValidation}
                onChange={(e) => {
                  setUserName(e.target.value);
                }}
              />
            </Box>
            <IconButton
              onClick={handleUserNameUpdate}
              disabled={
                userNameValidation.length > 0 ||
                !userName ||
                userName === userData?.userName
              }
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default UserSettingPage;
