import React, { useState, useContext } from "react";

import "./Auth.css";
import Card from "../../shared/components/UIElements/Card";
import Input from "../../shared/components/FormElements/Input";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import Button from "../../shared/components/FormElements/Button";
import ImageUplaod from "../../shared/components/FormElements/ImageUpload";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";

const Auth = () => {
  const auth = useContext(AuthContext);

  const [isLogin, setIsLogin] = useState(true);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const [formstate, inputHandler, setFormData] = useForm(
    {
      email: {
        value: "",
        isValid: false,
      },
      password: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  const switchModeHandler = () => {
    if (!isLogin) {
      setFormData(
        {
          ...formstate.inputs,
          name: undefined,
          image: undefined,
        },
        formstate.inputs.email.isValid && formstate.inputs.password.isValid
      );
    } else {
      setFormData(
        {
          ...formstate.inputs,
          name: {
            value: "",
            isValid: false,
          },
          image: {
            value: null,
            isValid: false,
          },
        },
        false
      );
    }
    setIsLogin((prevMode) => !prevMode);
  };

  const authSubmitHandler = async (event) => {
    event.preventDefault();

    if (isLogin) {
      try {
        const responseData = await sendRequest(
          "http://localhost:5000/api/user/login",
          "POST",
          JSON.stringify({
            email: formstate.inputs.email.value,
            password: formstate.inputs.password.value,
          }),
          {
            "Content-Type": "application/json",
          }
        );
        auth.login(responseData.user.id);
      } catch (error) {}
    } else {
      try {
        // const formData = new FormData();
        // formData.append("email", formstate.inputs.email.value);
        // formData.append("name", formstate.inputs.name.value);
        // formData.append("password", formstate.inputs.password.value);
        // formData.append("image", formstate.inputs.image.value);

        // const responseData = await sendRequest(
        //   "http://localhost:5000/api/user/signup",
        //   "POST",
        //   formData
        // );
        const formData = new FormData();
        formData.append("email", formstate.inputs.email.value);
        formData.append("name", formstate.inputs.name.value);
        formData.append("password", formstate.inputs.password.value);
        formData.append("image", formstate.inputs.image.value);
        const responseData = await sendRequest(
          "http://localhost:5000/api/user/signup",
          "POST",
          formData,
          {
            "Content-Type": undefined,
          }
        );
        console.log("ahiya avi");
        auth.login(responseData.user.id);
      } catch (error) {}
    }

    // console.log(formstate.inputs);
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Card className="authentication">
        {isLoading && <LoadingSpinner asOverlay />}
        <h2>Login Required</h2>
        <hr />
        <form onSubmit={authSubmitHandler}>
          {!isLogin && (
            <Input
              element="input"
              id="name"
              type="text"
              label="Name"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="Please Enter Text"
              onInput={inputHandler}
            />
          )}
          {!isLogin && <ImageUplaod center id="image" onInput={inputHandler} />}
          <Input
            element="input"
            id="email"
            type="email"
            label="E-Mail"
            validators={[VALIDATOR_EMAIL()]}
            errorText="Please enter valid email address"
            onInput={inputHandler}
          />
          <Input
            element="input"
            id="password"
            type="password"
            label="Password"
            validators={[VALIDATOR_MINLENGTH(6)]}
            errorText="Please enter valid password (atleast 6 character)"
            onInput={inputHandler}
          />
          <Button type="submit" disabled={!formstate.isValid}>
            {isLogin ? "LOGIN" : "SIGNUP"}
          </Button>
        </form>
        <Button inverse onClick={switchModeHandler}>
          SWITCH TO {isLogin ? "SIGNUP" : "LOGIN"}
        </Button>
      </Card>
    </React.Fragment>
  );
};

export default Auth;
