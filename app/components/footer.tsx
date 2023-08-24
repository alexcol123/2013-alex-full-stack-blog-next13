import { IconType } from "react-icons"
import Logo from "./Logo"
import { FaInstagram, FaFacebook, FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa'

const links = [
  FaGithub, FaInstagram, FaLinkedin, FaFacebook, FaTwitter
]

const IconContainer = (props: { icon: IconType }) => {
  return <props.icon size={25} className='cursor-pointer' />
}

const Footer = () => {
  return (
    <section className="bg-gray-100 w-full h-full">
      <hr className="p-3" />
      <div className="flex flex-col p-20 xs:gap-8 md:gap-6">
        <div className="flex md:flex-row xs:flex-col justify-center items-center md:justify-between  ">

          <div>
            <Logo />
          </div>
          <div className="flex p-2 gap-6">

            {links.map((item, i) => (
              <IconContainer key={i} icon={item} />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <p className="md:text-xl xs:text-md">
            <span>    {new Date().getFullYear()}</span>
            <span> &copy; Copyright</span>
            <span className="font-bold ml-2">Blogify</span>
          </p>
        </div>
      </div>

    </section>
  )
}

export default Footer