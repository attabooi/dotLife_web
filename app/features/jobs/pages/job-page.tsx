import { Badge } from "~/common/components/ui/badge";
import { Button } from "~/common/components/ui/button";

export const meta = () => {
  return [{ title: "Job | dotLife" }];
};

export default function JobPage() {
  return (
    <div>
        <div className="bg-gradient-to-tr from-primary/80 to-primary/10 h-60 w-full rounded-lg" />
        <div className="grid grid-cols-6 gap-20 -mt-20 items-start">
            <div className="col-span-4 space-y-10">
                <div className="size-40 bg-white rounded-full overflow-hidden relative left-10">
                    <img src="https://github.com/facebook.png" className="object-cover" />
                </div>
                <div>
                    <h1 className="text-4xl font-bold">Software Engineer</h1>
                    <h4 className="text-sm text-muted-foreground">Tesla</h4>
                </div>
                <div className="flex gap-2">
                    <Badge variant="secondary">Full-time</Badge>
                    <Badge variant="secondary">Remote</Badge>
                </div>
                <div className="space-y-2">
                    <h4 className="text-2xl font-bold">Overview</h4>
                    <p className="text-lg ">
                        This is a full time remote position.
                    </p>
                </div>
                <div className="space-y-2">
                    <h4 className="text-2xl font-bold">Responsibilities</h4>
                    <p className="text-lg list-disc list-inside">
                        {[
                            "Develop and maintain software applications",
                            "Collaborate with cross-functional teams to define, design, and ship new features",
                            "Work on bug fixing and improving application performance",
                            "Continuously discover, evaluate, and implement new technologies to maximize development efficiency"
                        ].map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </p>
                </div>
                <div className="space-y-2">
                    <h4 className="text-2xl font-bold">Requirements</h4>
                    <p className="text-lg list-disc list-inside">
                        {[
                            "Bachelor's degree in Computer Science or related field",
                            "3+ years of experience in software development",
                            "Strong proficiency in JavaScript, TypeScript, and React",
                            "Experience with Node.js and Express",
                            "Familiarity with RESTful APIs to connect mobile applications to back-end services",
                            "Understanding of security principles and their implementation in modern web applications"
                        ].map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </p>
                </div>
                <div className="space-y-2">
                    <h4 className="text-2xl font-bold">Salary</h4>
                    <p className="text-lg ">
                        $100,000 - $120,000
                    </p>
                </div>  
            </div>
            <div className="col-span-2 sticky top-20">
                <div className="flex flex-col gap-2">
                    <Button>Apply now</Button>
                </div>
            </div>
        </div>
    </div>
  );
} 