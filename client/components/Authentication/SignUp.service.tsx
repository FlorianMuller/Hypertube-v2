export interface UserInfo {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: FormData;
  [key: string]: string | FormData;
}

export interface UserError {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  [key: string]: string;
}

export const requiredErrorKey = 'authentication.signUp.error.required';
export const requiredPictureErrorKey = 'authentication.signUp.error.required.picture';

export const checkRequiredField = (userInfo: UserInfo): UserError => {
  const userError: UserError = {
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    picture: '',
  };
  const keys: string[] = Object.keys(userInfo);

  keys.forEach((key) => {
    if (key === 'picture' && userInfo[key] === null) {
      userError[key] = requiredPictureErrorKey;
    } else if (userInfo[key] === '') {
      userError[key] = requiredErrorKey;
    }
  });

  return userError;
};

export const validateEmail = (email: string): boolean => {
  const reg = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
  return reg.test(email);
};

export const validatePassword = (password: string): boolean => {
  const reg = /(?=^.{8,}$)((?!.*\s)(?=.*[A-Z])(?=.*[a-z]))((?=(.*\d){1,})|(?=(.*\W){1,}))^.*$/;
  return reg.test(password);
};

export const isThereError = (userError: UserError): boolean => {
  const keys: string[] = Object.keys(userError);
  let error = false;

  keys.forEach((key) => {
    if (userError[key] !== '') {
      error = true;
    }
  });
  return error;
};

export const sendSignUpData = (userInfo: UserInfo): void => {
  // todo: send userInfo to back
};