// components/PreviewMode.tsx
import { ChatToggler } from './chatToggler'

export const PreviewMode = () => {
  return (
    <div className="mockup-window border bg-base-300">
      <div className="px-4 py-16 bg-base-200">
        <ChatToggler />
        <div className="text-center mt-4">
          <div className="badge badge-accent">Preview Mode</div>
        </div>
      </div>
    </div>
  )
}