import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Building, Lock, ArrowRight, ChevronLeft } from 'lucide-react';
import styles from './Auth.module.css';

type AuthProps = {
    onLogin: () => void;
    onError: (error: string) => void;
    onBack: () => void;
};

const Auth: React.FC<AuthProps> = ({ onLogin, onError, onBack }) => {
    const [isLogin, setIsLogin] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        company: '',
        password: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateField = (name: string, value: string) => {
        let error = "";
        if (!value && name !== 'company') {
            if (name === 'fullName') error = "Please enter your full name.";
            else if (name === 'email') error = "Please enter your email address.";
            else if (name === 'phone') error = "Please enter your phone number.";
            else if (name === 'address') error = "Please enter your physical address.";
            else if (name === 'password') error = "Please enter a password.";
            else error = "This field is required.";
        } else if (name === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                if (!value.includes('@')) {
                    error = `Please include an '@' in the email address. '${value}' is missing an '@'.`;
                } else {
                    error = "Please enter a valid email address (e.g., name@example.com).";
                }
            }
        } else if (name === 'phone' && value) {
            const kenyaPhoneRegex = /^(\+254|0)[17]\d{8}$/;
            if (!kenyaPhoneRegex.test(value.replace(/\s/g, ''))) {
                error = "Please enter a valid phone number (e.g., 0712345678 or +254712345678).";
            }
        } else if (name === 'password' && value && value.length < 6) {
            error = "Password must be at least 6 characters long.";
        }
        return error;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error as the user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        if (error) {
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isLogin) {
            const newErrors: Record<string, string> = {};
            Object.keys(formData).forEach(key => {
                const error = validateField(key, formData[key as keyof typeof formData]);
                if (error) newErrors[key] = error;
            });

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                onError("Please correct the errors in the form.");
                return;
            }
        }

        onLogin();
    };

    return (
        <div className={styles.authWrapper}>
            <div className={styles.authContainer}>
                <button 
                    onClick={onBack}
                    className={styles.backButton}
                    title="Back to Home"
                >
                    <ChevronLeft size={18} />
                    <span>Back</span>
                </button>
                <h1 className={styles.title}>
                    {isLogin ? 'Welcome back' : 'Create an account'}
                </h1>
                <p className={styles.subtitle}>
                    {isLogin ? 'Log in to manage your content' : 'Join us to start managing your content'}
                </p>

                <form onSubmit={handleSubmit} className={styles.form} noValidate>
                    {!isLogin && (
                        <>
                            <div className={styles.formGroup}>
                                <label>Full Name</label>
                                <div className={styles.inputWrapper} title="Full Name">
                                    <User className={styles.inputIcon} size={16} />
                                    <input 
                                        name="fullName"
                                        type="text" 
                                        placeholder="Your Name" 
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={errors.fullName ? styles.errorInput : ''}
                                        required 
                                    />
                                </div>
                                {errors.fullName && <span className={styles.fieldError}>{errors.fullName}</span>}
                            </div>
                            
                            <div className={styles.formGroup}>
                                <label>Email Address</label>
                                <div className={styles.inputWrapper} title="Email Address">
                                    <Mail className={styles.inputIcon} size={16} />
                                    <input 
                                        name="email"
                                        type="email" 
                                        placeholder="you@example.com" 
                                        value={formData.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={errors.email ? styles.errorInput : ''}
                                        required 
                                    />
                                </div>
                                {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
                            </div>

                            <div className={styles.formGroup}>
                                <label>Phone Number</label>
                                <div className={styles.inputWrapper} title="Phone Number">
                                    <Phone className={styles.inputIcon} size={16} />
                                    <input 
                                        name="phone"
                                        type="tel" 
                                        placeholder="+254 712 345 678" 
                                        value={formData.phone}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={errors.phone ? styles.errorInput : ''}
                                        required 
                                    />
                                </div>
                                {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
                            </div>

                            <div className={styles.formGroup}>
                                <label>Address</label>
                                <div className={styles.inputWrapper} title="Address">
                                    <MapPin className={styles.inputIcon} size={16} />
                                    <input 
                                        name="address"
                                        type="text" 
                                        placeholder="Your Address" 
                                        value={formData.address}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={errors.address ? styles.errorInput : ''}
                                        required 
                                    />
                                </div>
                                {errors.address && <span className={styles.fieldError}>{errors.address}</span>}
                            </div>

                            <div className={styles.formGroup}>
                                <label>Company (Optional)</label>
                                <div className={styles.inputWrapper} title="Company">
                                    <Building className={styles.inputIcon} size={16} />
                                    <input 
                                        name="company"
                                        type="text" 
                                        placeholder="Your Company" 
                                        value={formData.company}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {isLogin && (
                        <div className={styles.formGroup}>
                            <label>Email Address</label>
                            <div className={styles.inputWrapper} title="Email Address">
                                <Mail className={styles.inputIcon} size={16} />
                                <input 
                                    name="email"
                                    type="email" 
                                    placeholder="you@example.com" 
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={errors.email ? styles.errorInput : ''}
                                    required 
                                />
                            </div>
                            {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label>Password</label>
                        <div className={styles.inputWrapper} title="Password">
                            <Lock className={styles.inputIcon} size={16} />
                            <input 
                                name="password"
                                type="password" 
                                placeholder="••••••••" 
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={errors.password ? styles.errorInput : ''}
                                required 
                            />
                        </div>
                        {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
                    </div>

                    <button type="submit" className={styles.submitButton}>
                        {isLogin ? 'Log In' : 'Sign Up'} <ArrowRight size={18} />
                    </button>
                </form>

                <div className={styles.footerText}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button 
                        type="button" 
                        className={styles.toggleButton}
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? 'Sign up' : 'Log in instead'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;
