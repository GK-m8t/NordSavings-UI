/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
const Background = ({ children }) => {
  return (
    // Remove transition-all to disable the background color transition.
    <body className="bg-primary dark:bg-primary transition-all">
      {children}
    </body>
  );
};

export default Background;
