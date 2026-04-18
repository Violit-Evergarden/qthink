import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="text-center">
        <p className="text-7xl font-bold bg-gradient-to-r from-(--color-gradient-from) via-(--color-gradient-via) to-(--color-gradient-to) bg-clip-text text-transparent">
          404
        </p>
        <h1 className="mt-4 text-2xl font-semibold">页面未找到</h1>
        <p className="mt-2 text-(--color-text-secondary)">
          你访问的页面不存在或已被移动。
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-(--color-accent) px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-(--color-accent-hover)"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
