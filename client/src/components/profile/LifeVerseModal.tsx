import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Heart, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FavoriteVerseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVerse?: string;
}

export function FavoriteVerseModal({ isOpen, onClose, currentVerse = "" }: FavoriteVerseModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [verse, setVerse] = useState(currentVerse);

  const saveVerseMutation = useMutation({
    mutationFn: async (favoriteVerse: string) => {
      return apiRequest('/api/profile/favorite-verse', 'PUT', { favoriteVerse });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      toast({
        title: "Favorite verse saved!",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/profile/progress'] });
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save favorite verse. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!verse.trim()) {
      toast({
        title: "Verse required",
        description: "Please enter your favorite verse before saving.",
        variant: "destructive",
      });
      return;
    }
    
    saveVerseMutation.mutate(verse.trim());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-spiritual-blue">
            <Heart className="h-5 w-5" />
            <span>Share Your Favorite Verse</span>
          </DialogTitle>
          <DialogDescription>
            Share a Bible verse that speaks to your heart and guides your faith journey.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="favorite-verse" className="text-sm font-medium">
              Your Favorite Verse
            </Label>
            <Textarea
              id="favorite-verse"
              placeholder='e.g., "For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, to give you hope and a future." - Jeremiah 29:11'
              value={verse}
              onChange={(e) => setVerse(e.target.value)}
              rows={4}
              className="resize-none border-spiritual-blue/20 focus:border-spiritual-blue"
            />
            <p className="text-xs text-gray-500">
              Include the verse text and reference (e.g., John 3:16)
            </p>
          </div>

          <div className="bg-spiritual-blue/5 p-4 rounded-lg border border-spiritual-blue/20">
            <div className="flex items-start space-x-3">
              <BookOpen className="h-5 w-5 text-spiritual-blue mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-spiritual-blue">
                  Why share your favorite verse?
                </h4>
                <p className="text-xs text-gray-700">
                  Your favorite verse helps our community understand what drives your faith and can inspire others in their spiritual journey.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={saveVerseMutation.isPending}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saveVerseMutation.isPending || !verse.trim()}
              className="bg-spiritual-blue hover:bg-spiritual-blue/90"
            >
              {saveVerseMutation.isPending ? "Saving..." : "Save Favorite Verse"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}