import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./store";

// Pre-typed hooks so components never import RootState/AppDispatch directly.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
