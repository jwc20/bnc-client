import {useMutation} from '@tanstack/react-query';
import {usersApiLoginMutation} from '../apis/@tanstack/react-query.gen';
import {useUserStore} from '../stores/userStore';
import {useNavigate} from 'react-router';

export default function LoginPage() {
    const setToken = useUserStore((state) => state.setToken);
    const setUserName = useUserStore((state) => state.setUserName);
    const navigate = useNavigate();

    const loginMutation = useMutation({
        ...usersApiLoginMutation(),
        onSuccess: (data) => {
            setToken(data.token);
            setUserName(data.username);
            // setExpiration(data.expiry);
            navigate('/lobby');
        },
        onError: (error) => {
            console.error('Login failed:', error);
            alert('Login failed. Check your credentials.');
        },
    });

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const email = form.email.value;
        const password = form.password.value;

        loginMutation.mutate({
            body: {email, password},
        });
    };

    return (
        <form onSubmit={handleLogin}>
            <input type="email" name="email" placeholder="Email" required/>
            <input type="password" name="password" placeholder="Password" required/>
            <button type="submit" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
}
