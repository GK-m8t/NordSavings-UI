import React from "react";
import Light from "../../assets/images/light.svg";
import Dark from "../../assets/images/dark.svg";
import { ThemeContext } from "./themeContext";

const Toggle = () => {
  const { theme, setTheme } = React.useContext(ThemeContext);
  return (
    <div className="transition duration-500 ease-in-out rounded-full p-2 flex gap-4 toggle">
      {/* {theme === "dark" ? ( */}
      <div>
        <img
          src={Light}
          alt="light"
          onClick={() =>
            theme === "light"
              ? setTheme("light")
              : setTheme(theme === "dark" ? "light" : "dark")
          }
          className="text-gray-500 dark:text-gray-400 text-2xl cursor-pointer h-8"
        />
      </div>
      {/* ) : ( */}
      <div>
        <img
          src={Dark}
          alt="dark"
          onClick={() =>
            theme === "dark"
              ? setTheme("dark")
              : setTheme(theme === "dark" ? "light" : "dark")
          }
          className="text-gray-500 dark:text-gray-400 text-2xl cursor-pointer h-8"
        />
      </div>
      {/* )} */}
    </div>
  );
};
export default Toggle;
