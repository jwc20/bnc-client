import { useMutation } from '@tanstack/react-query';
import { usersApiSignupMutation } from '../apis/@tanstack/react-query.gen';
import { useUserStore } from '../stores/userStore';
import { useNavigate } from 'react-router';

export default function RegisterPage() {
    const setToken = useUserStore((state) => state.setToken);
    const setUserName = useUserStore((state) => state.setUserName);
    const navigate = useNavigate();

    const signupMutation = useMutation({
        ...usersApiSignupMutation(),
        onSuccess: (data) => {
            setToken(data.token);
            setUserName(data.username);
            // setExpiration(data.expiry);
            navigate('/lobby'); // or '/' if preferred
        },
        onError: (error) => {
            console.error('Signup failed:', error);
            alert('Signup failed. Please try again.');
        },
    });

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const email = form.email.value;
        const password = form.password.value;
        const username = form.username?.value;

        signupMutation.mutate({
            body: { email, password, username }, // match your OpenAPI spec
        });
    };

    return (
        <form onSubmit={handleRegister}>
            <input type="email" name="email" placeholder="Email" required />
            <input type="text" name="username" placeholder="Username" required />
            <input type="password" name="password" placeholder="Password" required />
            <button type="submit" disabled={signupMutation.isPending}>
                {signupMutation.isPending ? 'Registering...' : 'Register'}
            </button>
        </form>
    );
}
