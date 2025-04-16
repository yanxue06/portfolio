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
    ],
    "Developer Tools": [
      { name: "HTML", color: "#4d4d4d" },
      { name: "CSS", color: "#4d4d4d" },
      { name: "SQL", color: "#4d4d4d" },
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
      { name: "Scikit Learn", color: "#4d4d4d" },
      { name: "Puncc - Conformal Prediction", color: "#4d4d4d" },
    ],
  };

  const categoryNames = Object.keys(categories);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl border border-gray-800">
      <h2 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-400">
        Tech Stack
      </h2>

      <Tabs defaultValue={categoryNames[0]} className="w-full">
        <TabsList
          className="grid w-full mb-6 bg-gray-800/50 p-1 rounded-lg"
          style={{
            gridTemplateColumns: `repeat(${categoryNames.length}, 1fr)`,
          }}
        >
          {categoryNames.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-teal-500 data-[state=active]:text-white rounded-md transition-all duration-300 ease-in-out"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categoryNames.map((category) => (
          <TabsContent key={category} value={category} className="mt-0">
            <Card className="border-0 bg-transparent shadow-none">
              <CardContent className="pt-0 px-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {categories[category as keyof typeof categories].map(
                    (tech) => (
                      <div
                        key={tech.name}
                        className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 hover:border-cyan-500/50 hover:bg-gray-700 transition-all duration-300 text-gray-200 rounded-lg px-4 py-3 text-center text-sm flex items-center justify-center shadow-sm hover:shadow-cyan-900/20 hover:shadow-md transform hover:-translate-y-1"
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
  );
}
