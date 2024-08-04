
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './components/auth/login';
import PrivateLayout from './components/layout/PrivateLayout';
import { Listing } from './components/billing/listing';
import { CreateBill } from './components/billing/createBill';
import { ViewBill } from './components/billing/viewBill';
import { EditBill } from './components/billing/editBill';


const PrivateRoute = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  return user ? children : <Navigate to="/login" />;
};
function App() {
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <PrivateLayout />
            </PrivateRoute>
          }
        >
          <Route
            path="bills"
            element={<Listing />}
          />
          <Route path='new-bill' element={<CreateBill/>}/>
          <Route path='view-bill/:id' element={<ViewBill/>}/>
          <Route path='edit-bill/:id' element={<EditBill/>}/>
        </Route>

        {/* Redirect any other route to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
