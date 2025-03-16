
import Game from '@/components/Game';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-100 to-blue-200 py-8 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-indigo-900 mb-2">Samurai Sprite Walker</h1>
        <p className="text-lg text-indigo-700">Use the arrow keys to walk left and right</p>
      </header>
      
      <main className="w-full max-w-2xl flex-1">
        <Game />
      </main>
      
      <footer className="mt-8 text-sm text-indigo-700 text-center">
        <p>Pixel art samurai sprite walker demo</p>
      </footer>
    </div>
  );
};

export default Index;
