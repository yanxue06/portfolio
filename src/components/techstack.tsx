import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent } from "./ui/card";

export function TechStack() {
  const categories = {
    Languages: [
      { name: "Python", color: "#4d4d4d" },
      { name: "C++", color: "#4d4d4d" },
      { name: "C", color: "#4d4d4d" },
      { name: "Java", color: "#4d4d4d" },
      { name: "TypeScript", color: "#4d4d4d" },
      { name: "JavaScript", color: "#4d4d4d" },
      { name: "SQL", color: "#4d4d4d" },
    ],
    "Developer Tools": [
      { name: "HTML", color: "#4d4d4d" },
      { name: "CSS", color: "#4d4d4d" },
      { name: "TailwindCSS", color: "#4d4d4d" },
      { name: "Git", color: "#4d4d4d" },
      { name: "Supabase", color: "#4d4d4d" },
      { name: "Firebase", color: "#4d4d4d" },
      { name: "Bash", color: "#4d4d4d" },
      { name: "Docker", color: "#4d4d4d" },
      { name: "AWS", color: "#4d4d4d" },
      { name: "VSCode", color: "#4d4d4d" },
      { name: "PyCharm", color: "#4d4d4d" },
      { name: "Cursor", color: "#4d4d4d" },
    ],
    Frameworks: [
      { name: "React", color: "#4d4d4d" },
      { name: "Angular", color: "#4d4d4d" },
      { name: "Node.js", color: "#4d4d4d" },
      { name: "Express", color: "#4d4d4d" },
      { name: "Flask", color: "#4d4d4d" },
      { name: "Django", color: "#4d4d4d" },
      { name: "FastAPI", color: "#4d4d4d" },
      { name: "REST", color: "#4d4d4d" },
      { name: "GraphQL", color: "#4d4d4d" },
      { name: "Socket.io", color: "#4d4d4d" },
      { name: "Vite", color: "#4d4d4d" },
      { name: "Next.js", color: "#4d4d4d" },
      { name: "Bootstrap", color: "#4d4d4d" },
    ],
    Libraries: [
      { name: "Pandas", color: "#4d4d4d" },
      { name: "OpenCV", color: "#4d4d4d" },
      { name: "MatplotLib", color: "#4d4d4d" },
      { name: "Scikit-learn", color: "#4d4d4d" },
    ],
  };

  const categoryNames = Object.keys(categories);

  return (
    <div className="flex justify-center w-[100%]">
      <div className="flex flex-col items-center justify-center lg:w-[70%] sm:w-[90%] max-w-[1000px]">
        {/* <h2 className="mb-8 text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">
          Tech Stack
        </h2> */}

        <Tabs defaultValue={categoryNames[0]} className="w-full">
          <TabsList
            className="grid w-full p-1 mb-6 rounded-lg bg-gray-800/50"
            style={{
              gridTemplateColumns: `repeat(${categoryNames.length}, 1fr)`,
            }}
          >
            {categoryNames.map((category) => (
              <TabsTrigger
                value={category}
                className="data-[state=active]:bg-gradient-to-r text-white data-[state=active]:from-cyan-500 data-[state=active]:to-teal-500 data-[state=active]:text-white rounded-md transition-all duration-300 ease-in-out"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categoryNames.map((category) => (
            <TabsContent key={category} value={category} className="mt-0">
              <Card className="bg-transparent border-0 shadow-none">
                <CardContent className="px-0 pt-0">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
                    {categories[category as keyof typeof categories].map(
                      (tech) => (
                        <div
                          key={tech.name}
                          className="flex items-center justify-center px-2 py-1 text-sm text-center text-gray-200 transition-all duration-300 transform border border-gray-700 rounded-lg shadow-sm bg-gray-800/80 backdrop-blur-sm hover:border-cyan-500/50 hover:bg-gray-700 hover:shadow-cyan-900/20 hover:shadow-md hover:-translate-y-1"
                        >
                          {tech.name}
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
