const Navbar = () => {
    return (
        <div className="w-3/4 mx-auto mt-5 p-4 border-b border-gray-200 shadow-md rounded-md">
            <div className="flex justify-between items-center">
                <span className="leading-tight">
                    <h1 className="bg-gradient-to-br from-gray-300 to-zinc-600 text-transparent bg-clip-text text-2xl font-bold leading-none">CodeCache</h1>
                    <p className="text-xs text-gray-500">your every code snippet vault</p>
                </span>
                <div className="flex gap-3">
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200">
                        Login
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-md transition-colors duration-200">
                        Sign Up
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Navbar