import { Calendar } from "lucide-react"

export default function Note() {
    return (
        <div className="flex flex-wrap">
            <div className="w-full h-40 m-10 p-4 bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 shadow-md flex flex-col relative">
                <h1 className="text-blue-600 text-center font-bold text-lg">Title</h1>
                <div className="text-sm"><Calendar className="text-blue-400" /> 1/12/2026</div>
                <p className="text-gray-700 mt-2 flex-1 overflow-hidden text-ellipsis">Note description goes here...</p>
            </div>
        </div>
    )
}