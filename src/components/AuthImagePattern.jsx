const AuthImagePattern = ({ title, subtitle }) => {
    return (
        <div className="hidden lg:flex items-center justify-center relative w-full h-full bg-gradient-to-r from-primary to-secondary p-12 overflow-hidden">
            <div className="absolute inset-0 flex justify-center items-center opacity-30">
                {/* Animated circles */}
                <div className="absolute w-40 h-40 bg-white/20 rounded-full blur-xl animate-spin-slow"></div>
                <div className="absolute w-32 h-32 bg-white/10 rounded-full blur-lg animate-pulse"></div>
                <div className="absolute w-24 h-24 bg-white/5 rounded-full blur-md animate-bounce"></div>
            </div>

            <div className="max-w-md text-center relative z-10">
                <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
                <p className="text-white/80">{subtitle}</p>
            </div>
        </div>
    );
};

export default AuthImagePattern;
