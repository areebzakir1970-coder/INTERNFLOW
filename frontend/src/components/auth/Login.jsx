import React, {useState} from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Link, useNavigate } from 'react-router-dom'
import { RadioGroup } from '@/components/ui/radio-group'
import { toast, Toaster } from 'sonner'
import axiosInstance from '../../utils/axiosConfig'
import { USER_API_END_POINT } from '../../utils/constant'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading, setUser } from '../../redux/authSlice'
import { clearJobData } from '../../redux/jobSlice'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {

  const [input, setInput] = useState({
      email: '',
      password: '',
      role: 'student',
    });
    const {loading} = useSelector((state) => state.auth);
     const navigate = useNavigate();
     const dispatch = useDispatch();
    const changeEventHandler = (e) => {
      setInput({
        ...input,
        [e.target.name]: e.target.value
      });
    }
  
    const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch(setLoading(true));
      
      // Clear previous user's data before login
      localStorage.clear();
      dispatch(clearJobData());
      
      const res = await axiosInstance.post(`${USER_API_END_POINT}/login`, input, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      if(res.data.success) {
        dispatch(setUser(res.data.user));
        toast.success(`Welcome, ${res.data.user?.fullname || 'User'}!`);
        navigate('/');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Login failed');
    }finally {
      dispatch(setLoading(false));
    }
  };

  // Google Login Handler
  const handleGoogleSuccess = async (credentialResponse) => {
    if (!input.role) {
      toast.error("⚠️ Please select a role (Student or Recruiter) before signing in with Google");
      return;
    }

    try {
      dispatch(setLoading(true));
      
      // Clear any existing persisted data before Google login to prevent data leakage
      localStorage.removeItem('persist:root');
      dispatch(clearJobData());
      
      const res = await axiosInstance.post(`${USER_API_END_POINT}/google`, {
        idToken: credentialResponse.credential,
        role: input.role || 'student'
      }, {
        headers: { "Content-Type": "application/json" }
      });

      if (res.data.success) {
        console.log('Google Login Success - User data:', res.data.user);
        console.log('Profile picture:', res.data.user?.profile?.profilePicture);
        
        // Set the user data in Redux (which will be persisted)
        dispatch(setUser(res.data.user));
        toast.success(res.data.message);
        navigate('/');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Google Login Failed");
    } finally {
      dispatch(setLoading(false));
    }
  };
    
  return (
    <div>
      <Navbar />
      <div className='flex items-center justify-center max-w-7xl mx-auto'>
        <form onSubmit={submitHandler} className='w-1/2 border border-gray-200 rounded-md p-4 my-10'>
          <h1 className='font-bold text-xl mb-5'>Login</h1>
          <div className='my-2'>
            <Label> Email </Label>
            <Input
              type="email"
              value={input.email}
              name="email"
              placeholder='ali@example.com'
              onChange={changeEventHandler}
            />
          </div>
          <div className='my-2'>
            <Label> Password </Label>
            <Input
              type="password"
              value={input.password}
              name="password"
              placeholder='********'
              onChange={changeEventHandler}
            />
          </div>
          <div className='flex items-center justify-between'>
            <RadioGroup className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Input 
                  type="radio"
                  name="role"
                  value="student"
                  checked={input.role === 'student'}
                  onChange={changeEventHandler}
                  className="cursor-pointer"
                />
                <Label htmlFor="r1">Student</Label>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="radio"
                  name="role"
                  value="recruiter"
                  checked={input.role === 'recruiter'}
                  onChange={changeEventHandler}
                  className="cursor-pointer"
                />
                <Label htmlFor="r2">Recruiter</Label>
              </div>
            </RadioGroup>
          </div>
          {
            loading ? <Button className="w-full my-4"><Loader2 className='mr-2 h-4 w-4 animate-spin' /> please wait </Button> :<button type='submit' className='w-full my-4 bg-black text-amber-50'>Login</button>
          }
          
          {/* Google Sign-In Section */}
          <div className='flex flex-col items-center justify-center w-full mt-2 mb-4'>
            <div className="relative flex py-2 items-center w-full">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">Or continue with</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                console.log('Login Failed');
                toast.error("Google Login Failed");
              }}
              width="384"
              theme="outline"
            />
            
            <p className='text-center text-sm text-gray-600 mt-2 bg-yellow-50 p-2 rounded border border-yellow-200'>
              ⚠️ <strong>Tip:</strong> Select your role (Student/Recruiter) above before signing in with Google
            </p>
          </div>
          
          <span className='text-sm'> Dont have an account? <Link to="/signup" className='text-white bg-blue-600 px-2 py-1 rounded'>Signup</Link></span>
        </form>
      </div>
    </div>
  )
}

export default Login