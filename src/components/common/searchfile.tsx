import { MagnifyingGlass } from "@phosphor-icons/react";

/**
 * A react component for a search field with a submit button.
 * It renders a text input with a submit button with a search icon.
 * The component accepts all the props that the input element accepts.
 * The component also styles the input field with tailwindcss.
 * The component is a functional component and does not have any state.
 * The component is not connected to the redux store.
 * @param {object} props - The props for the component.
 * @returns {React.ReactElement} - The component.
 */

interface SearchFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
	className?: string;
}

const SearchField = ({ className, ...props }: SearchFieldProps) => {
	return (
		<div className={`relative w-full ${className}`}>
			<input
				type="text"
				className="w-full px-3 py-2 border-1  border-[#COCOCOBF] text-black rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-zinc-400"
				placeholder="Search"
				{...props}
			/>
			<button
				type="submit"
				className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400"
				aria-label="Search"
			>
				<MagnifyingGlass size={32} />
			</button>
		</div>
	);
};

export default SearchField;
