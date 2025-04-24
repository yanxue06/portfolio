import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

const TimeLine = () => {
  return (
    <section style={{ width: "100%" }}>
      <motion.div
        initial={{ x: -40, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        style={{ width: "100%", display: "flex", justifyContent: "center" }}
      >
        <div className="flex flex-col justify-center gap-5">

          {/* const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
); */}  
          <Card className="text-sm font-light text-white ">
            <CardContent> 
              <CardTitle> 
                PROEJCTS
              </CardTitle>
              <CardHeader> 
                www
              </CardHeader> 
              <CardDescription>
                Feel free to check out my projects! I enjoy coding for social good
                and pratical tools, and, more recently, I've also been fiddling
                around with developing machine learning models
              </CardDescription>
              <Button
                variant="intro"
                className="border border-[#aacdf8] bg-white text-black transition-transform hover:scale-105 hover:shadow-md"
                onClick={() =>
                  <Link
                    to="/projects"
                  > 
                  </Link> 
                }
              >
                PROJECTS
              </Button>
            </CardContent>
          </Card> 

         
        </div>
      </motion.div>
    </section>
  );
};

export default TimeLine;
