import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import UserLayout from "@/layout/userLayout";


export default function Home() {
  const router = useRouter();

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.mainContainer}>
          <div className={styles.mainContainer_left}>
            <p>Connect With Friends without Exaggeration</p>
            <p>A true social media platform, with stories no blufs</p>
            <div
              onClick={() => {
                router.push("/login");
              }}
              className={styles.buttonJoin}
            >
              <p>Join Now</p>
            </div>
          </div>
          <div className={styles.mainContainer_right}>
            <img src="/connections.jpg" alt="connections" />
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
