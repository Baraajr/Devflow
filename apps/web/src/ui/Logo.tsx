import { Link } from 'react-router-dom';

function Logo() {
  return (
    <div>
      <Link to="/" className="text-xl font-bold">
        DevFlow
      </Link>{' '}
    </div>
  );
}

export default Logo;
