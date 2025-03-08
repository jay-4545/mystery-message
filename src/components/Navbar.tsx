"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { User } from "next-auth";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";

const StyledWrapper = styled.div`
  .hamburger {
    cursor: pointer;
  }

  .hamburger svg {
    height: 2.5em;
    transition: transform 0.4s ease-in-out;
  }

  .line {
    fill: none;
    stroke: black;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 3;
    transition:
      stroke-dasharray 0.4s ease-in-out,
      stroke-dashoffset 0.4s ease-in-out;
  }

  .line-top-bottom {
    stroke-dasharray: 12 63;
  }

  .hamburger.open svg {
    transform: rotate(-45deg);
  }

  .hamburger.open .line-top-bottom {
    stroke-dasharray: 20 300;
    stroke-dashoffset: -32.42;
  }

  .menu-wrapper {
    position: absolute;
    width: 100%;
    left: 0;
    top: 75%;
    padding: 10px;
    filter: drop-shadow(0px 10px 20px rgba(0, 0, 0, 0.3));
    transition: all 0.4s ease-in-out;
  }

  .menu-container {
    background-color: white;
    border-radius: 10px;
    overflow: hidden;
    clip-path: inset(10% 50% 90% 50% round 10px);
    transition: clip-path 0.4s ease-in-out;
  }

  .menu-open {
    clip-path: inset(0% 0% 0% 0% round 10px);
  }

  .menu-list {
    padding: 8px 10px;
    transition:
      background-color 0.2s ease-in-out,
      transform 0.4s ease-in-out,
      opacity 0.4s ease-in-out;
    transform: translateY(30px);
    opacity: 0;
  }

  .menu-list:hover {
    background-color: rgb(223, 223, 223);
  }

  .menu-open .menu-list {
    transform: translateY(0);
    opacity: 1;
  }

  .menu-open .menu-list:nth-child(1) {
    transition-delay: 0.2s;
  }

  .menu-open .menu-list:nth-child(2) {
    transition-delay: 0.35s;
  }

  .menu-open .menu-list:nth-child(3) {
    transition-delay: 0.5s;
  }
`;

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: session, status } = useSession();
  const pathname = usePathname();

  const user: User = session?.user as User;

  const handleClick = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <nav className="2xl:px-[200px] md:px-12 px-6 py-6 shadow-md relative ">
      <div className="justify-between items-center hidden lg:flex">
        <Link className="lg:text-4xl md:text-3xl text-xl font-bold" href="/">
          Mystery Message
        </Link>

        <div>
          {session ? (
            <div className="flex items-center justify-end lg:gap-10 gap-2 flex-wrap md:flex-nowrap">
              <span className="lg:text-2xl text-sm font-medium">
                Welcome,&nbsp;
                <span className="font-bold">
                  {user?.username || user?.email}
                </span>
              </span>
              <div className="flex items-center sm:gap-4 gap-2">
                {pathname.startsWith("/dashboard") ? (
                  <Link href="/">
                    <Button variant="outline">Home</Button>
                  </Link>
                ) : (
                  <Link href="/dashboard">
                    <Button variant="outline">Dashboard</Button>
                  </Link>
                )}
                <Button className="w-max" onClick={() => signOut()}>
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            status !== "loading" && (
              <Link href="/signin">
                <Button>Login</Button>
              </Link>
            )
          )}
        </div>
      </div>

      <div className="lg:hidden flex justify-between items-center">
        <Link className="text-xl font-bold" href="/">
          Mystery Message
        </Link>

        <StyledWrapper>
          <button
            className={`hamburger ${isOpen ? "open" : ""}`}
            aria-label="Toggle menu"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <svg viewBox="0 0 32 32">
              <path
                className="line line-top-bottom"
                d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
              />
              <path className="line" d="M7 16 27 16" />
            </svg>
          </button>

          {isOpen && (
            <div className="menu-wrapper">
              <section
                className={`menu-container px-4 py-4 ${
                  isOpen ? "menu-open" : ""
                }`}
              >
                {session ? (
                  <div className="flex flex-col gap-4">
                    <span
                      className={`text-base text-center font-medium menu-list ${
                        isOpen ? "menu-visible" : ""
                      }`}
                    >
                      Welcome,&nbsp;
                      <span className="font-bold">
                        {user?.username || user?.email}
                      </span>
                    </span>
                    <div className="flex flex-col gap-3">
                      {pathname.startsWith("/dashboard") ? (
                        <Link href="/">
                          <Button
                            variant="outline"
                            className={`menu-list w-full ${isOpen ? "menu-visible" : ""}`}
                            onClick={handleClick}
                          >
                            Home
                          </Button>
                        </Link>
                      ) : (
                        <Link href="/dashboard">
                          <Button
                            variant="outline"
                            className={`menu-list w-full ${isOpen ? "menu-visible" : ""}`}
                            onClick={handleClick}
                          >
                            Dashboard
                          </Button>
                        </Link>
                      )}
                      <Button
                        className={`w-full menu-list ${isOpen ? "menu-visible" : ""}`}
                        onClick={() => {
                          signOut();
                          handleClick();
                        }}
                      >
                        Logout
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Link href="/signin">
                    <Button
                      className={`menu-list w-full ${isOpen ? "menu-visible" : "hidden"}`}
                      onClick={handleClick}
                    >
                      Login
                    </Button>
                  </Link>
                )}
              </section>
            </div>
          )}
        </StyledWrapper>
      </div>
    </nav>
  );
}

export default Navbar;
