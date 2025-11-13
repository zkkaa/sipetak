export default function Button(props: { title: string; onClick?: () => void; className?: string }) {
    return (
        <button className={`w-fit text-sm md:text-base rounded-xl transition-all duration-300 ease-in-out active:scale-95 cursor-pointer ${props.className}`} onClick={props.onClick}>
            {props.title}
        </button>
    );
}