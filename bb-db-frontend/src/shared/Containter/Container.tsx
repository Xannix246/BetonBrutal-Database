import clsx from "clsx";

type Props = {
    children: React.ReactNode;
    className?: string;
}

const Container = ({ children, className }: Props) => {
    return (
        <div className={clsx("p-3 bg-black/70", className)}>
            {children}
        </div>
    );
}

export default Container;