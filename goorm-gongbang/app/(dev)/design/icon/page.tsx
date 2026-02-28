import { CheckIcon, Cross2Icon, ChevronDownIcon } from '@radix-ui/react-icons';
import { Heart, Home, Settings } from 'lucide-react';

export default function icon() {
    return (
        <div className="flex items-center gap-3">
            {/* radix icon */}
            <CheckIcon className="h-4 w-4" />
            <Cross2Icon className="h-4 w-4" />
            <ChevronDownIcon className="h-4 w-4" />
            
            {/* lucide icon */}
            <Heart className="h-4 w-4" />
            <Home className="h-4 w-4" />
            <Settings className="h-4 w-4" />
        </div>
    );
}
