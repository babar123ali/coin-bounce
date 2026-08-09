import Navbar from "./component/Navbar/Navbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Footer from "./component/Footer/Footer";
import styles from "./App.module.css";
import Protected from "./component/Protected/Protected";
import Error from "./pages/Error/Error";
import Login from "./pages/Login/Login";
import { useSelector } from "react-redux";
import Signup from "./pages/Signup/Signup";
import Crypto from "./pages/Crypto/Crypto";
import Blog from "./pages/Blog/Blog";
import SubmitBlog from "./pages/SubmitBlog/SubmitBlog";
import BlogDetails from "./pages/BlogDetails/BlogDetails";
import UpdateBlog from "./pages/UpdateBlog/UpdateBlog";
function App() {
  const isAuth = useSelector((state) => state.user.auth);
  return (
    <div className={styles.container}>
      <BrowserRouter>
        <div className={styles.layout}>
          <Navbar />
          <Routes>
            <Route
              path="/"
              element={<div className={styles.main}>{<Home />}</div>}
            />

            <Route
              path="crypto"
              element={
                <div className={styles.main}>
                  <Crypto />
                </div>
              }
            />

            <Route
              path="blogs"
              element={
                <Protected isAuth={isAuth}>
                  <div className={styles.main}>
                    <Blog />
                  </div>
                </Protected>
              }
            />

            <Route
              path="blog/:id"
              element={
                <Protected isAuth={isAuth}>
                  <div className={styles.main}>
                    <BlogDetails />
                  </div>
                </Protected>
              }
            />
            <Route
              path="blog-update/:id"
              element={
                <Protected isAuth={isAuth}>
                  <div className={styles.main}>
                    <UpdateBlog />
                  </div>
                </Protected>
              }
            />

            <Route
              path="submit"
              element={
                <Protected isAuth={isAuth}>
                  <div className={styles.main}>
                    <SubmitBlog />
                  </div>
                </Protected>
              }
            />

            <Route
              path="signup"
              element={
                <div className={styles.main}>
                  <Signup />
                </div>
              }
            />

            <Route
              path="login"
              element={
                <div className={styles.main}>
                  <Login />
                </div>
              }
            />

            <Route
              path="*"
              element={
                <div className={styles.main}>
                  <Error />
                </div>
              }
            />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
