const SignupPageLayout = ({title, children}) => {
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-9 md:gap-10 lg:gap-14 w-full mt-2">
          <div className="flex flex-col justify-center items-center gap-8">
            <div className="flex gap-2 justify-center items-center tracking-wide">
              <span className="text-white font-bold text-xl md:text-2xl">
                {title}
              </span>
            </div>
            <img
              src="/logo.png"
              alt="logo"
              className="h-[80px] sm:h-[100px] md:h-[170px] lg:h-[270px] w-auto"
            />
          </div>
          {/*<hr className="bg-white/20 hidden sm:block sm:h-[400px] sm:w-[1px] sm:mr-7 mx-3" />*/}
          <div>
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPageLayout;
