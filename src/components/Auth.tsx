import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Building, Lock, ArrowRight } from 'lucide-react';
import styles from './Auth.module.css';

type AuthProps = {
    onLogin: () => void;
    onError: (error: string) => void;
};

const Auth: React.FC<AuthProps> = ({ onLogin, onError }) => {
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
            error = "This field is required";
        } else if (name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) error = "Invalid email format";
        } else if (name === 'phone') {
            const kenyaPhoneRegex = /^(\+254|0)[17]\d{8}$/;
            if (!kenyaPhoneRegex.test(value.replace(/\s/g, ''))) error = "Invalid phone format";
        }
        return error;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
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
                <h1 className={styles.title}>
                    {isLogin ? 'Welcome back' : 'Create an account'}
                </h1>
                <p className={styles.subtitle}>
                    {isLogin ? 'Log in to manage your content' : 'Join us to start managing your content'}
                </p>

                <form onSubmit={handleSubmit} className={styles.form}>
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
                                    className={errors.email ? styles.errorInput : ''}
                                    required 
                                />
                            </div>
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
